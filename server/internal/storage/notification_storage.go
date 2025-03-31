package storage

import (
	"course-flow/internal/types"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/uuid"
)

type NotificationStorage struct {
	db *sql.DB
}

func NewNotificationStorage(db *sql.DB) *NotificationStorage {
	return &NotificationStorage{db: db}
}

func (s *NotificationStorage) CreateNotifications(notifications []types.Notification) ([]types.Notification, error) {
	fmt.Println("notification", notifications)
	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction for creating notifications: %w", err)
	}
	defer func() {
		if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				log.Printf("Failed to rollback transaction: %v", rollbackErr)
			}
		}
	}()

	stmt, err := tx.Prepare(`
        INSERT INTO notifications (id, type, class_id, recipient_id, message, data, timestamp, is_read)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
    `)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare insert statement for notifications: %w", err)
	}
	defer stmt.Close()

	var createdNotifications []types.Notification
	for i, notif := range notifications {
		dataJSON, err := json.Marshal(notif.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal data for notification %d: %w", i, err)
		}

		for j, recipientID := range notif.RecipientIDs {
			uniqueID := uuid.New().String()
			var insertedID string

			err = stmt.QueryRow(
				uniqueID,
				notif.Type,
				notif.ClassID,
				recipientID,
				notif.Message,
				dataJSON,
				notif.Timestamp,
				notif.Read,
			).Scan(&insertedID)
			if err != nil {
				return nil, fmt.Errorf("failed to execute insert for notification %d, recipient %d: %w", i, j, err)
			}

			log.Printf("Inserted notification: id=%s, type=%s, class_id=%s, recipient_id=%s",
				insertedID, notif.Type, notif.ClassID, recipientID)

			// Create a new notification object with the inserted ID
			createdNotifications = append(createdNotifications, types.Notification{
				ID:           insertedID,
				Type:         notif.Type,
				ClassID:      notif.ClassID,
				RecipientIDs: []string{recipientID},
				Message:      notif.Message,
				Data:         notif.Data,
				Timestamp:    notif.Timestamp,
				Read:         notif.Read,
			})
		}
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction for creating notifications: %w", err)
	}
	log.Printf("Successfully committed transaction for %d notifications", len(notifications))
	return createdNotifications, nil
}

func (s *NotificationStorage) GetUserNotifications(userID string) ([]types.Notification, error) {
	rows, err := s.db.Query(`
        SELECT id, type, class_id, message, data, timestamp, is_read
        FROM notifications
        WHERE recipient_id = $1
        ORDER BY timestamp DESC
    `, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query notifications for user %s: %w", userID, err)
	}
	defer rows.Close()

	var notifications []types.Notification
	for i := 0; rows.Next(); i++ {
		var ntf types.Notification
		var dataJSON []byte

		err = rows.Scan(&ntf.ID, &ntf.Type, &ntf.ClassID, &ntf.Message, &dataJSON, &ntf.Timestamp, &ntf.Read)
		if err != nil {
			return nil, fmt.Errorf("failed to scan notification row %d for user %s: %w", i, userID, err)
		}

		if err = json.Unmarshal(dataJSON, &ntf.Data); err != nil {
			return nil, fmt.Errorf("failed to unmarshal data for notification row %d for user %s: %w", i, userID, err)
		}

		ntf.RecipientIDs = []string{userID}
		notifications = append(notifications, ntf)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating notification rows for user %s: %w", userID, err)
	}

	return notifications, nil
}

func (s *NotificationStorage) MarkNotificationAsRead(notificationID string) error {
	result, err := s.db.Exec(`
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1 AND is_read = FALSE
    `, notificationID)
	if err != nil {
		return fmt.Errorf("failed to update notification %s to mark as read: %w", notificationID, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected for marking notification %s as read: %w", notificationID, err)
	}
	log.Printf("Updated notification as read: id=%s, rows_affected=%d", notificationID, rowsAffected)
	if rowsAffected == 0 {
		return fmt.Errorf("no notification found with id %s or it was already marked as read", notificationID)
	}

	return nil
}

func (s *NotificationStorage) MarkAllNotificationsAsRead(userID string) error {
	result, err := s.db.Exec(`
        UPDATE notifications
        SET is_read = TRUE
        WHERE recipient_id = $1 AND is_read = FALSE
    `, userID)
	if err != nil {
		return fmt.Errorf("failed to mark all notifications as read for user %s: %w", userID, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected for marking all notifications as read for user %s: %w", userID, err)
	}
	log.Printf("Marked all notifications as read: user_id=%s, rows_affected=%d", userID, rowsAffected)

	return nil
}

func (s *NotificationStorage) ClearAllNotifications(userID string) error {
	result, err := s.db.Exec(`
        DELETE FROM notifications
        WHERE recipient_id = $1
    `, userID)
	if err != nil {
		return fmt.Errorf("failed to clear all notifications for user %s: %w", userID, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected for clearing all notifications for user %s: %w", userID, err)
	}
	log.Printf("Cleared all notifications: user_id=%s, rows_affected=%d", userID, rowsAffected)

	return nil
}
