package services

import (
	"course-flow/internal/storage"
	"course-flow/internal/types"
	"course-flow/internal/utils"
	"database/sql"
	"fmt"
	"net/http"
	"time"
)

type NotificationService struct {
	courseMemberStorage *storage.CourseMemberStorage
	notificationStorage *storage.NotificationStorage
}

func NewNotificationService(db *sql.DB) *NotificationService {
	return &NotificationService{
		courseMemberStorage: storage.NewCourseMemberStorage(db),
		notificationStorage: storage.NewNotificationStorage(db),
	}
}

func (s *NotificationService) CreatePostCreatedNotifications(classID, postContent, creatorID string) ([]types.Notification, error) {
	// Fetch all class members
	members, err := s.courseMemberStorage.GetAllMember(classID)
	if err != nil {
		return nil, err
	}

	var className string
	err = s.courseMemberStorage.DB.QueryRow("SELECT name FROM courses WHERE id = $1", classID).Scan(&className)
	if err != nil {
		return nil, err
	}

	var recipientIDs []string
	var name string
	for _, member := range members {
		if member.ID != creatorID {
			recipientIDs = append(recipientIDs, member.ID)
		}
		if member.ID == creatorID {
			name = member.FirstName + " " + member.LastName
		}
	}

	if name == "" {
		return nil, &utils.ApiError{
			Code:    http.StatusNotFound,
			Message: fmt.Sprintf("User with id %v not found", creatorID),
		}
	}

	// Prepare notification
	notification := types.Notification{
		Type:         types.TypePostCreated,
		ClassID:      classID,
		RecipientIDs: recipientIDs,
		Message:      fmt.Sprintf("New post in %s by %s", className, name),
		Data:         map[string]string{"creatorId": creatorID, "content": postContent},
		Timestamp:    time.Now().UTC(),
	}

	// Store in database
	err = s.notificationStorage.CreateNotifications([]types.Notification{notification})
	if err != nil {
		return nil, err
	}

	return []types.Notification{notification}, nil
}

func (s *NotificationService) GetUserNotifications(userID string) ([]types.Notification, error) {
    return s.notificationStorage.GetUserNotifications(userID)
}

func (s *NotificationService) MarkNotificationAsRead(notificationID string) error {
    return s.notificationStorage.MarkNotificationAsRead(notificationID)
}

func (s *NotificationService) MarkAllNotificationsAsRead(userID string) error {
    return s.notificationStorage.MarkAllNotificationsAsRead(userID)
}

func (s *NotificationService) ClearAllNotifications(userID string) error {
    return s.notificationStorage.ClearAllNotifications(userID)
}
