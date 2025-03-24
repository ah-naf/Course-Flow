package models

import "time"

type Document struct {
	ID        string    `json:"id,omitempty"`
	UserID    string    `json:"user_id,omitempty"` // Owner of the document
	FileName  string    `json:"file_name,omitempty"`
	FilePath  string    `json:"file_path,omitempty"` // Now allows longer paths
	FileType  string    `json:"file_type,omitempty"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}
