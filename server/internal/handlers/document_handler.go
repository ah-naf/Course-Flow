package handlers

import (
	"collab-editor/internal/services"
	"collab-editor/internal/utils"
	"net/http"
)

type DocumentHandler struct {
	Service *services.DocumentService
}

func NewDocumentHandler(service *services.DocumentService) *DocumentHandler {
	return &DocumentHandler{Service: service}
}

func (h *DocumentHandler) UploadDocumentHandler(w http.ResponseWriter, r *http.Request) error {
	userID, err := utils.ExtractUserIDFromToken(r)
	if err != nil {
		return err
	}

	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "File too large"}
	}

	// Get all uploaded files from the "document" form field
	files := r.MultipartForm.File["document"]

	// Check if files were uploaded
	if len(files) == 0 {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "No files uploaded"}
	}

	_, err = h.Service.SaveFilesToLocal(files, userID)
	if err != nil {
		return err
	}

	// for _, fp := range filePaths {
	// 	fmt.Printf("%+v\n", fp)
	// }

	return utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "File uploaded successfully"})
}
