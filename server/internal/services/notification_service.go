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
	postStorage         *storage.PostStorage
	courseStorage       *storage.CourseStorage
	userStorage         *storage.UserStorage
}

func NewNotificationService(db *sql.DB) *NotificationService {
	return &NotificationService{
		courseMemberStorage: storage.NewCourseMemberStorage(db),
		notificationStorage: storage.NewNotificationStorage(db),
		postStorage:         storage.NewPostStorage(db),
		courseStorage:       storage.NewCourseStorage(db),
		userStorage:         storage.NewUserStorage(db),
	}
}

func (s *NotificationService) ChangeRoleNotification(classID, userID string, role int) ([]types.Notification, error) {
	className, err := s.courseStorage.GetCourseName(classID)
	if err != nil {
		return nil, err
	}

	user, err := s.userStorage.GetUserWithID(userID)
	if err != nil {
		return nil, err
	}

	message := ""
	switch role {
	case 1:
		message = fmt.Sprintf("You have been assigned as a member of the course \"%s\".", className)
	case 2:
		message = fmt.Sprintf("You have been promoted to moderator in the course \"%s\".", className)
	case 3:
		message = fmt.Sprintf("You have been appointed as an instructor for the course \"%s\".", className)
	case 4:
		message = fmt.Sprintf("You have been designated as the admin of the course \"%s\".", className)
	default:
		return nil, fmt.Errorf("invalid role: %d", role)
	}

	notification := types.Notification{
		Type:         types.TypeRoleChanged,
		ClassID:      classID,
		RecipientIDs: []string{user.ID},
		Message:      message,
		Timestamp:    time.Now().UTC(),
	}

	// Store in database
	createdNotifications, err := s.notificationStorage.CreateNotifications([]types.Notification{notification})
	if err != nil {
		return nil, err
	}

	return createdNotifications, nil
}

func (s *NotificationService) UserKickedNotification(payload types.NotifKickedResponse) ([]types.Notification, error) {
	className, err := s.courseStorage.GetCourseName(payload.ClassID)
	if err != nil {
		return nil, err
	}

	kickedUser, err := s.userStorage.GetUserWithID(payload.UserID)
	if err != nil {
		return nil, err
	}

	notification := types.Notification{
		Type:         types.TypeUserKicked,
		ClassID:      payload.ClassID,
		RecipientIDs: []string{kickedUser.ID},
		Message:      fmt.Sprintf("You have been kicked out from the class \"%s\"", className),
		Timestamp:    time.Now().UTC(),
		Data:         payload.Data,
	}

	// Store in database
	createdNotifications, err := s.notificationStorage.CreateNotifications([]types.Notification{notification})
	if err != nil {
		return nil, err
	}

	return createdNotifications, nil
}

func (s *NotificationService) CreateCommentAddedNotification(payload types.NotifCommentCreatedResponse) ([]types.Notification, error) {
	whoCreated, tempRecipientIDs, err := s.postStorage.GetAllCommentedUserForPost(payload.PostID, payload.CommentID)
	if err != nil {
		return nil, err
	}

	var recipientIDs []string
	isIDTaken := make(map[string]bool)
	for _, id := range tempRecipientIDs {
		if _, ok := isIDTaken[id]; ok {
			continue
		}
		if id != payload.UserID {
			recipientIDs = append(recipientIDs, id)
			isIDTaken[id] = true
		}
	}

	className, err := s.courseStorage.GetCourseName(payload.ClassID)
	if err != nil {
		return nil, err
	}

	postAuthor, err := s.postStorage.GetPostAuthor(payload.PostID)
	if err != nil {
		return nil, err
	}

	if payload.Data != nil {
		payload.Data["user"] = whoCreated
	}
	notification := types.Notification{
		Type:         types.TypeCommentAdded,
		ClassID:      payload.ClassID,
		RecipientIDs: recipientIDs,
		Message: fmt.Sprintf(
			"%s %s just commented on %s %s's post in \"%s\". Check out the discussion!",
			whoCreated.FirstName,
			whoCreated.LastName,
			postAuthor.FirstName,
			postAuthor.LastName,
			className,
		),
		Timestamp: time.Now().UTC(),
		Data:      payload.Data,
	}
	// Store in database
	createdNotifications, err := s.notificationStorage.CreateNotifications([]types.Notification{notification})
	if err != nil {
		return nil, err
	}

	return createdNotifications, nil
}

func (s *NotificationService) CreatePostCreatedNotifications(classID, postContent, creatorID string) ([]types.Notification, error) {
	// Fetch all class members
	members, err := s.courseMemberStorage.GetAllMember(classID)
	if err != nil {
		return nil, err
	}

	className, err := s.courseStorage.GetCourseName(classID)
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
	createdNotifications, err := s.notificationStorage.CreateNotifications([]types.Notification{notification})
	if err != nil {
		return nil, err
	}

	return createdNotifications, nil
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
