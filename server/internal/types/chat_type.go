package types

import "time"

type ChatMessage struct {
	ID        string    `json:"id"`
	CourseID  string    `json:"course_id"`
	Sender    User      `json:"sender"`
	Content   string    `json:"text"`
	Timestamp time.Time `json:"timestamp"`
}
