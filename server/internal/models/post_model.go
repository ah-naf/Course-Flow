package models

import "time"

type Post struct {
	ID        string    `json:"id,omitempty"`
	CourseID  string    `json:"course_id,omitempty"`
	UserID    string    `json:"user_id,omitempty"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PostResponse struct {
	Post
	User       User         `json:"user"`
	Attachment []Attachment `json:"attachments,omitempty"`
}
