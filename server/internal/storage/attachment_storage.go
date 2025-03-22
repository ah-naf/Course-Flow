package storage

import (
	"course-flow/internal/models"
	"database/sql"
)

type AttachmentStorage struct {
	DB *sql.DB
}

func NewAttachmentStorage(db *sql.DB) *AttachmentStorage {
	return &AttachmentStorage{
		DB: db,
	}
}

// SaveAttachment stores an attachment in the database
func (s *AttachmentStorage) SaveAttachment(attachment *models.Attachment) error {
	query := `
		INSERT INTO attachments (post_id, document_id, uploaded_by, upload_date)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	return s.DB.QueryRow(
		query,
		attachment.PostID,
		attachment.DocumentID,
		attachment.UploadedBy,
		attachment.UploadDate,
	).Scan(&attachment.ID)
}
