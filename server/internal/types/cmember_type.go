package types

import "time"

type CourseMember struct {
	User
	CreatedAt time.Time `json:"created_at"`
	Role      *int   `json:"role"`
}
