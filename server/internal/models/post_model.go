package models

import "time"

type Post struct {
	ID        string `json:"id"`
	CourseID  string `json:"course_id"`
	UserID    string `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PostResponse struct {
	Post
	User User `json:"user"`
}
