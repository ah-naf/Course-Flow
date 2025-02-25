package models

import "time"

type Document struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"` // Owner of the document
	FileName  string    `json:"file_name"`
	FilePath  string    `json:"file_path"` // Now allows longer paths
	FileType  string    `json:"file_type"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
