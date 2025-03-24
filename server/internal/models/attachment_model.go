package models

import (
	"time"
)

// Attachment represents a file attached to a post
type Attachment struct {
	ID         string    `json:"id,omitempty"`
	PostID     string    `json:"post_id,omitempty"`
	DocumentID string    `json:"document_id,omitempty"`
	UploadedBy string    `json:"uploaded_by,omitempty"`
	UploadDate time.Time `json:"upload_date,omitempty"`

	// For convenience, we can include the related document information
	Document *Document `json:"document,omitempty"`
}
