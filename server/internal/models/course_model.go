package models

import "time"

type Course struct {
	ID              string    `json:"id"`
	Name            string    `json:"name" validate:"required,max=100"`
	Description     string    `json:"description" validate:"max=500"`
	InstructorID    string    `json:"instructor_id"`
	BackgroundColor string    `json:"background_color" validate:"max=7"`
	CoverPic        string    `json:"cover_pic"`
	JoinCode        string    `json:"join_code" validate:"required,min=4,max=20,alphanum"`
	IsPrivate       bool      `json:"is_private"`
	IsArchived      bool      `json:"archived"`
	PostPermission  string    `json:"post_permission" validate:"max=20"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CourseListResponse struct {
	ID              string `json:"id"`
	Name            string `json:"name" validate:"required,max=100"`
	Description     string `json:"description" validate:"max=500"`
	BackgroundColor string `json:"background_color" validate:"max=7"`
	CoverPic        string `json:"cover_pic"`
	Instructor      User   `json:"instructor"`
}
