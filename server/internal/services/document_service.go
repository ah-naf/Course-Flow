package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"time"
)

type DocumentService struct {
	DocumentStorage *storage.DocumentStorage
}

func NewDocumentService(documentStorage *storage.DocumentStorage) *DocumentService {
	return &DocumentService{DocumentStorage: documentStorage}
}

// UploadDocument saves the document metadata
func (s *DocumentService) UploadDocument(userID, title, description, filePath, fileType string) (*models.Document, error) {
	doc := &models.Document{
		UserID:      userID,
		Title:       title,
		Description: description,
		FilePath:    filePath,
		FileType:    fileType,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.DocumentStorage.SaveDocument(doc); err != nil {
		return nil, err
	}
	return doc, nil
}

// GetDocument retrieves a document by ID
func (s *DocumentService) GetDocument(id string) (*models.Document, error) {
	return s.DocumentStorage.GetDocument(id)
}

// DeleteDocument deletes a document by ID
func (s *DocumentService) DeleteDocument(id, userID string) error {
	return s.DocumentStorage.DeleteDocument(id, userID)
}
