package storage

import (
	"course-flow/internal/types"
	"database/sql"
	"encoding/json"
)

type NotificationStorage struct {
	db *sql.DB
}

func NewNotificationStorage(db *sql.DB) *NotificationStorage {
	return &NotificationStorage{db: db}
}

func (s *NotificationStorage) CreateNotifications(notifications []types.Notification) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
        INSERT INTO notifications (type, class_id, recipient_id, message, data, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
    `)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, notif := range notifications {
		dataJSON, err := json.Marshal(notif.Data)
		if err != nil {
			return err
		}

		for _, recipientID := range notif.RecipientIDs {
			_, err = stmt.Exec(
				notif.Type,
				notif.ClassID,
				recipientID,
				notif.Message,
				dataJSON,
				notif.Timestamp,
			)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func (s *NotificationStorage) GetUserNotifications(userID string) ([]types.Notification, error) {
	rows, err := s.db.Query(`
        SELECT type, class_id, message, data, timestamp, is_read
        FROM notifications
        WHERE recipient_id = $1
        ORDER BY timestamp DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []types.Notification
	for rows.Next() {
		var ntf types.Notification
		var dataJSON []byte

		err = rows.Scan(&ntf.Type, &ntf.ClassID, &ntf.Message, &dataJSON, &ntf.Timestamp, &ntf.Read)
		if err != nil {
			return nil, err
		}

		if err = json.Unmarshal(dataJSON, &ntf.Data); err != nil {
			return nil, err
		}

		ntf.RecipientIDs = []string{userID}
		notifications = append(notifications, ntf)
	}

	return notifications, nil
}

func (s *NotificationStorage) MarkNotificationAsRead(notificationID string) error {
	_, err := s.db.Exec(`
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
    `, notificationID)
	return err
}
