package models

import (
	"time"
)

// Attachment represents a file attached to a post
type Attachment struct {
	ID         string    `json:"id"`
	PostID     string    `json:"post_id"`
	DocumentID string    `json:"document_id"`
	UploadedBy string    `json:"uploaded_by"`
	UploadDate time.Time `json:"upload_date"`

	// For convenience, we can include the related document information
	Document *Document `json:"document,omitempty"`
}
