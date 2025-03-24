package models

import "time"

// User represents a registered user in the system.
type User struct {
	ID           string    `json:"id,omitempty"`        // You can store UUIDs as strings or use a UUID type from a library.
	Email        string    `json:"email,omitempty"`     // Unique email for login and communication.
	Username     string    `json:"username,omitempty"`  // Optional unique username.
	PasswordHash string    `json:"-,omitempty"`         // Do NOT expose this in JSON responses.
	FirstName    string    `json:"firstName,omitempty"` // Optional first name.
	LastName     string    `json:"lastName,omitempty"`  // Optional last name.
	CreatedAt    time.Time `json:"-,omitempty"`         // Timestamp of account creation.
	UpdatedAt    time.Time `json:"-,omitempty"`         // Timestamp of the last profile update.
	Avatar       string    `json:"avatar"`
}

type UserRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Username  string `json:"username" validate:"required,min=3,max=32"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"firstName" validate:"required,min=3,max=32"`
	LastName  string `json:"lastName" validate:"required,min=3,max=32"`
}
