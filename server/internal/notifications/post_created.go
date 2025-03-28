package notifications

import (
	"course-flow/internal/storage"
	"course-flow/internal/types"
	"course-flow/internal/utils"
	"course-flow/internal/websocket"
	"database/sql"
	"fmt"
	"net/http"
	"time"
)

type PostCreatedNotifier struct {
	hub     *websocket.Hub
	storage *storage.CourseMemberStorage
}

func NewPostCreatedNotifier(hub *websocket.Hub, db *sql.DB) *PostCreatedNotifier {
	return &PostCreatedNotifier{
		hub:     hub,
		storage: storage.NewCourseMemberStorage(db),
	}
}

func (n *PostCreatedNotifier) Notify(classID, postContent, creatorID string) error {
	// Fetch all class members
	members, err := n.storage.GetAllMember(classID)
	if err != nil {
		return err
	}

	var className string
	err = n.storage.DB.QueryRow("SELECT name FROM courses WHERE id = $1", classID).Scan(&className)
	if err != nil {
		return err
	}
	// fmt.Println("classname", className)

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
	// fmt.Println("recipient and name", recipientIDs, name)
	if name == "" {
		return &utils.ApiError{Code: http.StatusNotFound, Message: fmt.Sprintf("User with id %v not found", creatorID)}
	}

	// Send notification
	notification := types.Notification{
		Type:         types.TypePostCreated,
		ClassID:      classID,
		RecipientIDs: recipientIDs,
		Message:      fmt.Sprintf("New post in %s by %s", className, name),
		Data:         map[string]string{"creatorId": creatorID, "content": postContent},
		Timestamp:    time.Now().UTC(),
	}
	n.hub.Notify(notification)
	return nil
}
