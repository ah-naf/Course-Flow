package storage

import (
	"course-flow/internal/models"
	"course-flow/internal/utils"
	"database/sql"
	"fmt"
	"log"
	"net/http"
)

type DocumentStorage struct {
	DB *sql.DB
}

func NewDocumentStorage(db *sql.DB) *DocumentStorage {
	return &DocumentStorage{
		DB: db,
	}
}

// stores a document in the database
func (s *DocumentStorage) SaveDocument(doc *models.Document) error {
	query := `
		INSERT INTO documents (user_id, file_name, file_path, file_type, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`
	err := s.DB.QueryRow(query, doc.UserID, doc.FileName, doc.FilePath, doc.FileType, doc.CreatedAt, doc.UpdatedAt).Scan(&doc.ID)
	if err != nil {
		return fmt.Errorf("failed to save document: %w", err)
	}

	log.Printf("Successfully saved document with id %s", doc.ID)
	return nil
}

// GetDocument retrieves a document by its ID
func (s *DocumentStorage) GetDocument(id string) (*models.Document, error) {
	var doc models.Document
	query := `SELECT id, user_id, file_name, file_path, file_type, created_at, updated_at FROM documents WHERE id = $1`
	err := s.DB.QueryRow(query, id).Scan(&doc.ID, &doc.UserID, &doc.FileName, &doc.FilePath, &doc.FileType, &doc.CreatedAt, &doc.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve document with id %s: %w", id, err)
	}
	return &doc, nil
}

// DeleteDocument removes a document from the database
func (s *DocumentStorage) DeleteDocument(id string, userID string) error {
	query := `DELETE FROM documents WHERE id = $1 AND user_id = $2`
	result, err := s.DB.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete document with id %s for user %s: %w", id, userID, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to retrieve affected rows for document id %s for user %s: %w", id, userID, err)
	}

	if rowsAffected == 0 {
		return &utils.ApiError{Code: http.StatusNotFound, Message: "No document found or you don't have permission to delete it"}
	}

	log.Printf("Successfully deleted document with id %s for user %s", id, userID)
	return nil
}
