package types

import (
	"encoding/json"
	"time"
)

type NotificationType string

const (
	TypePostCreated  NotificationType = "post_created"
	TypeCommentAdded NotificationType = "comment_added"
	TypeMessageSent  NotificationType = "message_sent"
	TypeRoleChanged  NotificationType = "role_changed"
	TypeUserKicked   NotificationType = "user_kicked"
)

type NotifMessageSentResponse struct {
	ClassID    string                 `json:"class_id"`
	UserID     string                 `json:"user_id"`
	MessageID  string                 `json:"message_id"`
	Content    string                 `json:"content"`
	Data       map[string]interface{} `json:"data"`
}

type NotifKickedResponse struct {
	ClassID string
	AdminID  string
	UserID  string
	Data    map[string]interface{}
}

type NotifCreatedResponse struct {
	ClassID string
	UserID  string
	PostID  string
	Data    map[string]interface{}
}

type NotifCommentCreatedResponse struct {
	ClassID   string
	UserID    string
	PostID    string
	CommentID string
	Data      map[string]interface{}
}

type Notification struct {
	ID           string           `json:"id"`
	Type         NotificationType `json:"type"`
	ClassID      string           `json:"classId"`
	RecipientIDs []string         `json:"-"` // Users to notify
	Message      string           `json:"message"`
	Data         interface{}      `json:"data"` // Additional data (e.g., post content, user info)
	Timestamp    time.Time        `json:"timestamp"`
	Read         bool             `json:"read"`
}

func (n *Notification) ToJSON() ([]byte, error) {
	return json.Marshal(n)
}
