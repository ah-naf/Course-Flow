package services

import (
	"course-flow/internal/types"
	"course-flow/internal/storage"
	"course-flow/internal/utils"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"
)

// fileResult is used to capture the result for each file saved.
type fileResult struct {
	metadata types.Document
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
func (s *DocumentService) SaveFilesToLocal(fileHeaders []*multipart.FileHeader, userID string) ([]types.Document, error) {
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
				result <- fileResult{
					err: &utils.ApiError{
						Code:    http.StatusBadRequest,
						Message: "Error opening file",
					},
				}
				return
			}
			defer file.Close()

			// Save the file locally.
			filePath, err := s.SaveFileToLocal(file, fh.Filename)
			if err != nil {
				result <- fileResult{err: err}
				return
			}

			// Extract file extension using filepath.Ext.
			ext := filepath.Ext(fh.Filename)
			fileType := ""
			if len(ext) > 0 {
				// Remove the dot from the extension.
				fileType = ext[1:]
			}

			// Create document metadata (ID is omitted).
			doc := types.Document{
				UserID:    userID,
				FileName:  fh.Filename,
				FilePath:  filePath,
				FileType:  fileType,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}

			// Save document metadata to the database.
			if err := s.DocumentStorage.SaveDocument(&doc); err != nil {
				result <- fileResult{err: err}
				return
			}

			// Send the result with document metadata.
			result <- fileResult{
				metadata: doc,
				err:      nil,
			}
		}(fh)
	}

	wg.Wait()
	close(result)

	// Collect results
	var files []types.Document
	for res := range result {
		if res.err != nil {
			return nil, res.err
		}
		files = append(files, res.metadata)
	}

	return files, nil
}

// UploadDocument saves the document metadata
func (s *DocumentService) UploadDocument(userID, filePath, fileType, fileName string) (*types.Document, error) {
	doc := &types.Document{
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
func (s *DocumentService) GetDocument(id string) (*types.Document, error) {
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

	// Format timestamp without spaces and special characters
	timestamp := time.Now().UTC().Format("20060102_150405")

	// Sanitize filename - replace spaces and special characters
	sanitizedFilename := strings.ReplaceAll(filename, " ", "_")
	// Remove any other problematic characters
	re := regexp.MustCompile(`[^\w\.-]`)
	sanitizedFilename = re.ReplaceAllString(sanitizedFilename, "_")

	uniqueName := fmt.Sprintf("%s_%s", timestamp, sanitizedFilename)

	// Ensure the directory exists
	if err := os.MkdirAll(mediaDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %v", err)
	}

	// Create the full system path for storage
	fullPath := filepath.Join(mediaDir, uniqueName)
	fmt.Println("path", fullPath)
	out, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	// Return the URL path, not the full system path
	return fullPath, nil
}
