package services

import (
	"course-flow/internal/storage"
	"course-flow/internal/types"
	"course-flow/internal/utils"
	"fmt"
	"net/http"
	"time"
)

type ChatService struct {
	storage     *storage.ChatStorage
	userStorage *storage.UserStorage
}

func NewChatService(storage *storage.ChatStorage, userStorage *storage.UserStorage) *ChatService {
	return &ChatService{storage: storage, userStorage: userStorage}
}

func (s *ChatService) ProcessChatMessage(chatMsg *types.ChatMessage) error {
	// Validate the message
	if chatMsg.CourseID == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Course ID is required",
		}
	}
	if chatMsg.FromID == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Sender ID is required",
		}
	}
	if chatMsg.Content == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Message content is required",
		}
	}

	if chatMsg.Timestamp.IsZero() {
		chatMsg.Timestamp = time.Now().UTC()
	}

	if err := s.storage.CreateChatMessage(chatMsg); err != nil {
		return fmt.Errorf("failed to save chat message: %v", err)
	}

	user, err := s.userStorage.GetUserWithID(chatMsg.FromID)
	if err != nil {
		return fmt.Errorf("failed to fetch user: %v", err)
	}
	chatMsg.Sender = *user

	return nil
}

func (s *ChatService) GetMessagesByCourse(courseID, userID string) ([]types.ChatMessage, error) {
	messages, err := s.storage.GetMessageByCourse(courseID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch messages: %v", err)
	}
	return messages, nil
}
