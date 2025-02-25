package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"collab-editor/internal/utils"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"
)

type DocumentService struct {
	DocumentStorage *storage.DocumentStorage
}

func NewDocumentService(documentStorage *storage.DocumentStorage) *DocumentService {
	return &DocumentService{DocumentStorage: documentStorage}
}

func (s *DocumentService) SaveFileToLocal(file multipart.File, filename string) (string, error) {
	// TODO: Handle file save
	mediaDir := utils.GetEnv("MEDIA_DIR")

	timestamp := time.Now().Format("20060102_150405")
	uniqueName := fmt.Sprintf("%s_%s", timestamp, filename)
	filePath := filepath.Join(mediaDir, uniqueName)

	return "", nil
}

// UploadDocument saves the document metadata
func (s *DocumentService) UploadDocument(userID, title, description, filePath, fileType, fileName string) (*models.Document, error) {
	doc := &models.Document{
		UserID:    userID,
		FilePath:  filePath,
		FileType:  fileType,
		FileName:  fileName,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
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
