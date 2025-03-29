package notifications

import (
	"course-flow/internal/services"
	"course-flow/internal/websocket"
	"database/sql"
)

type PostCreatedNotifier struct {
	hub     *websocket.Hub
	service *services.NotificationService
}

func NewPostCreatedNotifier(hub *websocket.Hub, db *sql.DB) *PostCreatedNotifier {
	return &PostCreatedNotifier{
		hub:     hub,
		service: services.NewNotificationService(db),
	}
}

func (n *PostCreatedNotifier) Notify(classID, postContent, creatorID string) error {
	// Create notifications through service
	notifications, err := n.service.CreatePostCreatedNotifications(classID, postContent, creatorID)
	if err != nil {
		return err
	}

	// Send real-time notifications via WebSocket
	for _, notif := range notifications {
		n.hub.Notify(notif)
	}

	return nil
}
