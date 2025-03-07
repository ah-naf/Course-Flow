package models

import "time"

// User represents a registered user in the system.
type User struct {
	ID           string     `json:"id"`         // You can store UUIDs as strings or use a UUID type from a library.
	Email        string     `json:"email"`      // Unique email for login and communication.
	Username     string     `json:"username"`   // Optional unique username.
	PasswordHash string     `json:"-"`          // Do NOT expose this in JSON responses.
	FirstName    string     `json:"firstName"`  // Optional first name.
	LastName     string     `json:"lastName"`   // Optional last name.
	CreatedAt    time.Time  `json:"created_at"` // Timestamp of account creation.
	UpdatedAt    time.Time  `json:"updated_at"` // Timestamp of the last profile update.
	LastLogin    *time.Time `json:"last_login"` // Pointer so nil can represent no login.
	Avatar       string     `json:"avatar"`
}

type UserRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Username  string `json:"username" validate:"required,min=3,max=32"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"firstName" validate:"required,min=3,max=32"`
	LastName  string `json:"lastName" validate:"required,min=3,max=32"`
}
