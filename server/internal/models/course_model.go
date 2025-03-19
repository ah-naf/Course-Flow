package models

import (
	"time"
)

type Course struct {
	ID              string    `json:"id"`
	Name            string    `json:"name" validate:"required,max=100"`
	Description     string    `json:"description" validate:"max=500"`
	AdminID         string    `json:"admin_id"`
	BackgroundColor string    `json:"background_color" validate:"max=7"`
	CoverPic        string    `json:"cover_pic"`
	JoinCode        string    `json:"join_code" validate:"required,min=4,max=20,alphanum"`
	IsPrivate       bool      `json:"is_private"`
	IsArchived      bool      `json:"archived"`
	PostPermission  int       `json:"post_permission"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CourseListResponse struct {
	Course
	Admin User `json:"admin"`
	Role  *int `json:"role"`
}

type CoursePreviewResponse struct {
	TotalMembers int `json:"total_members"`
	CourseListResponse
}
