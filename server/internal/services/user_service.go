package services

import (
	"course-flow/internal/models"
	"course-flow/internal/storage"
	"course-flow/internal/utils"
	"net/http"
	"time"
)

type UserService struct {
	Storage         *storage.UserStorage
	DocumentService *DocumentService
}

func NewUserService(storage *storage.UserStorage, documentStorage *storage.DocumentStorage) *UserService {
	documentService := NewDocumentService(documentStorage)
	return &UserService{
		Storage:         storage,
		DocumentService: documentService,
	}
}

func (s *UserService) GetUserWithID(r *http.Request) (*models.User, error) {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	return s.Storage.GetUserWithID(userID)
}

func (s *UserService) EditUserDetails(user *models.User, r *http.Request) error {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "File too large"}
	}

	files := r.MultipartForm.File["avatar"]

	uploadedDoc, err := s.DocumentService.SaveFilesToLocal(files, userID)
	if err != nil {
		return err
	}

	if len(uploadedDoc) > 0 {
		user.Avatar = uploadedDoc[0].FilePath
	}

	user.ID = userID
	user.UpdatedAt = time.Now()

	if user.FirstName == "" || user.LastName == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "First name and last name are required",
		}
	}

	return s.Storage.EditUserDetails(user)
}

func (s *UserService) GetAllUser() ([]*models.User, error) {
	return s.Storage.GetAllUser()
}
