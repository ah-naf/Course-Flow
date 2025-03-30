package notifications

import (
	"course-flow/internal/services"
	"course-flow/internal/websocket"
	"database/sql"
)

type CommentAddedNotifier struct {
	hub     *websocket.Hub
	service *services.NotificationService
}

func NewCommentAddedNotifier(hub *websocket.Hub, db *sql.DB) *CommentAddedNotifier {
	return &CommentAddedNotifier{
		hub:     hub,
		service: services.NewNotificationService(db),
	}
}

func (n *CommentAddedNotifier) Notify(classID, postID, creatorID string) error {
	notifications, err := n.service.CreateCommentAddedNotification(postID, classID, creatorID)
	if err != nil {
		return err
	}

	for _, notif := range notifications {
		n.hub.Notify(notif)
	}

	return nil
}
