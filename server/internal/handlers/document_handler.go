package handlers

import (
	"collab-editor/internal/services"
	"collab-editor/internal/utils"
	"fmt"
	"net/http"
)

type DocumentHandler struct {
	Service *services.DocumentService
}

func NewDocumentHandler(service *services.DocumentService) *DocumentHandler {
	return &DocumentHandler{Service: service}
}

func (h *DocumentHandler) UploadDocumentHandler(w http.ResponseWriter, r *http.Request) error {
	// _, err := utils.ExtractUserIDFromToken(r)
	// if err != nil {
	// 	return err
	// }

	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "File too large"}
	}

	// Get all uploaded files from the "document" form field
	files := r.MultipartForm.File["document"]

	// Check if files were uploaded
	if len(files) == 0 {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "No files uploaded"}
	}

	// Iterate over all uploaded files
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return &utils.ApiError{Code: http.StatusBadRequest, Message: "Error opening file"}
		}
		defer file.Close()

		fmt.Println("File Name:", fileHeader.Filename)
		fmt.Println("File Type:", fileHeader.Header.Get("Content-Type"))
		fmt.Println("File Size:", fileHeader.Size, "bytes")

		// Define file path
		filePath := "/uploads/" + fileHeader.Filename
		fmt.Println("File Path:", filePath)
	}

	return nil
}
