package storage

import (
	"course-flow/internal/types"
	"course-flow/internal/utils"
	"database/sql"
	"fmt"
	"time"
)

type ChatStorage struct {
	DB *sql.DB
}

func NewChatStorage(db *sql.DB) *ChatStorage {
	return &ChatStorage{
		DB: db,
	}
}

func (s *ChatStorage) CreateChatMessage(chatMsg *types.ChatMessage) error {
	query := `
		INSERT INTO messages (course_id, from_id, content, created_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	err := s.DB.QueryRow(
		query,
		chatMsg.CourseID,
		chatMsg.FromID,
		chatMsg.Content,
		time.Now().UTC(),
	).Scan(&chatMsg.ID, &chatMsg.Timestamp)
	if err != nil {
		return fmt.Errorf("failed to create chat message: %v", err)
	}
	return nil
}

func (s *ChatStorage) GetMessageByCourse(courseID, userID string) ([]types.ChatMessage, error) {
	isMember, err := s.isCourseMember(courseID, userID)
	if err != nil {
		return nil, &utils.ApiError{
			Code:    500, // Internal Server Error
			Message: fmt.Sprintf("database error: %v", err),
		}
	}
	if !isMember {
		return nil, &utils.ApiError{
			Code:    403, // Forbidden
			Message: fmt.Sprintf("user %s is not a member of course %s", userID, courseID),
		}
	}

	query := `
        SELECT m.id, m.course_id, m.content, m.created_at,
               u.id, u.avatar, u.first_name, u.last_name, u.username, u.email
        FROM messages m
        JOIN users u ON m.from_id = u.id
        WHERE m.course_id = $1
        ORDER BY m.created_at ASC
    `
	rows, err := s.DB.Query(query, courseID)
	if err != nil {
		return nil, &utils.ApiError{
			Code:    500,
			Message: fmt.Sprintf("database query error: %v", err),
		}
	}
	defer rows.Close()

	var messages []types.ChatMessage
	for rows.Next() {
		var msg types.ChatMessage
		var user types.User

		err := rows.Scan(
			&msg.ID, &msg.CourseID, &msg.Content, &msg.Timestamp,
			&user.ID, &user.Avatar, &user.FirstName, &user.LastName, &user.Username, &user.Email,
		)
		if err != nil {
			return nil, &utils.ApiError{
				Code:    500,
				Message: fmt.Sprintf("error scanning message: %v", err),
			}
		}
		user.Avatar = utils.NormalizeMedia(user.Avatar)
		msg.Sender = user
		messages = append(messages, msg)
	}

	if err = rows.Err(); err != nil {
		return nil, &utils.ApiError{
			Code:    500,
			Message: fmt.Sprintf("error iterating over message rows: %v", err),
		}
	}

	return messages, nil
}

func (s *ChatStorage) isCourseMember(courseID, userID string) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS (
			SELECT 1 
			FROM course_members 
			WHERE course_id = $1 AND user_id = $2
		)
	`
	err := s.DB.QueryRow(query, courseID, userID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
