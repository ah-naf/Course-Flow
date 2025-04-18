package storage

import (
	"course-flow/internal/types"
	"course-flow/internal/utils"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"
)

type AttachmentStorage struct {
	DB *sql.DB
}

func NewAttachmentStorage(db *sql.DB) *AttachmentStorage {
	return &AttachmentStorage{
		DB: db,
	}
}

func (s *AttachmentStorage) GetAllAttachmentsForPost(postID string) ([]types.Attachment, error) {
	query := `
		SELECT 
			a.id AS attachment_id,
			a.post_id,
			a.document_id,
			a.upload_date,
			d.id AS doc_id,
			d.file_name,
			d.file_path,
			d.file_type,
			d.created_at AS doc_created_at,
			d.updated_at AS doc_updated_at,
			u.id AS user_id,
			u.email,
			u.username,
			u.first_name,
			u.last_name,
			u.avatar
		FROM attachments a
		JOIN documents d ON a.document_id = d.id
		LEFT JOIN users u ON a.uploaded_by = u.id
		WHERE a.post_id = $1
		ORDER BY a.upload_date DESC
	`

	rows, err := s.DB.Query(query, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to query attachments for post %s: %v", postID, err)
	}
	defer rows.Close()

	var attachments []types.Attachment
	attachmentMap := make(map[string]*types.Attachment)

	for rows.Next() {
		var (
			attachmentID, postID, documentID             string
			uploadDate                                   time.Time
			docID                                        string
			fileName, filePath, fileType                 string
			docCreatedAt, docUpdatedAt                   time.Time
			userID, email, username, firstName, lastName sql.NullString
			avatar                                       sql.NullString
		)

		err := rows.Scan(
			&attachmentID, &postID, &documentID, &uploadDate,
			&docID, &fileName, &filePath, &fileType, &docCreatedAt, &docUpdatedAt,
			&userID, &email, &username, &firstName, &lastName, &avatar,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		// Create or update the attachment in the map
		attachment, exists := attachmentMap[attachmentID]
		if !exists {
			var user *types.User
			if userID.Valid { // Only create a User struct if the user exists
				user = &types.User{
					ID:        userID.String,
					Email:     email.String,
					Username:  username.String,
					FirstName: firstName.String,
					LastName:  lastName.String,
					Avatar:    avatar.String,
				}
				user.Avatar = utils.NormalizeMedia(user.Avatar)
			}

			attachment = &types.Attachment{
				ID:         attachmentID,
				PostID:     postID,
				DocumentID: documentID,
				UploadDate: uploadDate,
				Document: &types.Document{
					ID:        docID,
					FileName:  fileName,
					FilePath:  filePath,
					FileType:  fileType,
					CreatedAt: docCreatedAt,
					UpdatedAt: docUpdatedAt,
				},
				User: user, // Set the User field
			}
			attachment.Document.FilePath = utils.NormalizeMedia(attachment.Document.FilePath)
			attachmentMap[attachmentID] = attachment
			attachments = append(attachments, *attachment)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %v", err)
	}

	return attachments, nil
}

func (s *AttachmentStorage) GetAllAttachmentsForCourse(courseID string) ([]types.Attachment, error) {
	query := `
		SELECT 
			a.id AS attachment_id,
			a.post_id,
			a.document_id,
			a.upload_date,
			d.id AS doc_id,
			d.file_name,
			d.file_path,
			d.file_type,
			d.created_at AS doc_created_at,
			d.updated_at AS doc_updated_at,
			u.id AS user_id,
			u.email,
			u.username,
			u.first_name,
			u.last_name,
			u.avatar
		FROM attachments a
		JOIN posts p ON a.post_id = p.id
		JOIN documents d ON a.document_id = d.id
		LEFT JOIN users u ON a.uploaded_by = u.id
		WHERE p.course_id = $1
		ORDER BY a.upload_date DESC
	`

	rows, err := s.DB.Query(query, courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to query attachments: %v", err)
	}
	defer rows.Close()

	var attachments []types.Attachment
	attachmentMap := make(map[string]*types.Attachment)

	for rows.Next() {
		var (
			attachmentID, postID, documentID             string
			uploadDate                                   time.Time
			docID                                        string
			fileName, filePath, fileType                 string
			docCreatedAt, docUpdatedAt                   time.Time
			userID, email, username, firstName, lastName sql.NullString
			avatar                                       sql.NullString
		)

		err := rows.Scan(
			&attachmentID, &postID, &documentID, &uploadDate,
			&docID, &fileName, &filePath, &fileType, &docCreatedAt, &docUpdatedAt,
			&userID, &email, &username, &firstName, &lastName, &avatar,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		// Create or update the attachment in the map
		attachment, exists := attachmentMap[attachmentID]
		if !exists {
			var user *types.User
			if userID.Valid { // Only create a User struct if the user exists
				user = &types.User{
					ID:        userID.String,
					Email:     email.String,
					Username:  username.String,
					FirstName: firstName.String,
					LastName:  lastName.String,
					Avatar:    avatar.String,
				}
				user.Avatar = utils.NormalizeMedia(user.Avatar)
			}

			attachment = &types.Attachment{
				ID:         attachmentID,
				PostID:     postID,
				DocumentID: documentID,
				UploadDate: uploadDate,
				Document: &types.Document{
					ID:        docID,
					FileName:  fileName,
					FilePath:  filePath,
					FileType:  fileType,
					CreatedAt: docCreatedAt,
					UpdatedAt: docUpdatedAt,
				},
				User: user, // Set the User field
			}
			attachment.Document.FilePath = utils.NormalizeMedia(attachment.Document.FilePath)
			attachmentMap[attachmentID] = attachment
			attachments = append(attachments, *attachment)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %v", err)
	}

	return attachments, nil
}

func (s *AttachmentStorage) DeleteAttachment(id, userID string) error {
	// Begin a transaction
	tx, err := s.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback() // Rollback if the function exits without committing

	query := `
		DELETE FROM attachments
		WHERE id = $1 AND uploaded_by = $2
	`

	result, err := tx.Exec(query, id, userID)
	if err != nil {
		fmt.Println("e", err)
		return fmt.Errorf("failed to delete attachment: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return &utils.ApiError{
			Code:    http.StatusNotFound,
			Message: "Attachment not found or you are not authorized",
		}
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	log.Printf("Successfully deleted attachment %s by user %s", id, userID)
	return nil
}

// SaveAttachment stores an attachment in the database
func (s *AttachmentStorage) SaveAttachment(attachment *types.Attachment) error {
	query := `
		INSERT INTO attachments (post_id, document_id, uploaded_by, upload_date)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	err := s.DB.QueryRow(
		query,
		attachment.PostID,
		attachment.DocumentID,
		attachment.UploadedBy,
		attachment.UploadDate,
	).Scan(&attachment.ID)
	if err != nil {
		return fmt.Errorf("failed to save attachment: %v", err)
	}
	
	log.Printf("Successfully saved attachment with id %s", attachment.ID)
	return nil
}
