package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"collab-editor/internal/utils"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// fileResult is used to capture the result for each file saved.
type fileResult struct {
	filePath string
	err      error
}

type DocumentService struct {
	DocumentStorage *storage.DocumentStorage
}

func NewDocumentService(documentStorage *storage.DocumentStorage) *DocumentService {
	return &DocumentService{DocumentStorage: documentStorage}
}

// SaveFilesToLocal processes a slice of file headers concurrently.
// It returns a slice of file paths (one for each successfully saved file)
// or an error if any file fails to save.
func (s *DocumentService) SaveFilesToLocal(fileHeaders []*multipart.FileHeader) ([]string, error) {
	// channel to limit concurrency. For example we will handle 10 file concurrently at a time
	concurrencyLimit := 10
	sem := make(chan struct{}, concurrencyLimit)

	// channel to collect the result
	result := make(chan fileResult, len(fileHeaders))
	var wg sync.WaitGroup

	for _, fh := range fileHeaders {
		wg.Add(1)
		sem <- struct{}{} // acquire the slot

		go func(fh *multipart.FileHeader) {
			defer wg.Done()
			defer func() { <-sem }() // release the slot

			// Open the uploaded file
			file, err := fh.Open()
			if err != nil {
				result <- fileResult{"", &utils.ApiError{
					Code:    http.StatusBadRequest,
					Message: "Error opening file",
				}}
				return
			}
			defer file.Close()

			// Save the file using the existing SaveFileToLocal method
			filePath, err := s.SaveFileToLocal(file, fh.Filename)
			result <- fileResult{filePath, err}
		}(fh)
	}

	wg.Wait()
	close(result)

	// Collect results
	var filePaths []string
	for res := range result {
		if res.err != nil {
			return nil, res.err
		}
		filePaths = append(filePaths, res.filePath)
	}

	return filePaths, nil
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

// SaveFileToLocal saves a single file to the local filesystem.
// It returns the file path where the file was stored.
func (s *DocumentService) SaveFileToLocal(file multipart.File, filename string) (string, error) {
	mediaDir := utils.GetEnv("MEDIA_DIR")

	timestamp := time.Now().Format("20060102_150405")
	uniqueName := fmt.Sprintf("%s_%s", timestamp, filename)
	filePath := filepath.Join(mediaDir, uniqueName)

	out, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	return filePath, nil
}
