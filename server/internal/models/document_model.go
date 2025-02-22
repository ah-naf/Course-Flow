package models

import "time"

type Document struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`  // Owner of the document
	Title       string    `json:"title"`
	Description string    `json:"description"`
	FilePath    string    `json:"file_path"` // Now allows longer paths
	FileType    string    `json:"file_type"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
