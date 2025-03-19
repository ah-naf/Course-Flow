package models

type CourseMember struct {
	User
	CreatedAt string `json:"created_at"`
	Role      *int   `json:"role"`
}
