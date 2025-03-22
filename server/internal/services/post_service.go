package services

import (
	"course-flow/internal/storage"
	"course-flow/internal/utils"
	"net/http"

	"github.com/gorilla/mux"
)

type PostService struct {
	PostStorage *storage.PostStorage
}

func NewPostService(postStorage *storage.PostStorage) *PostService {
	return &PostService{PostStorage: postStorage}
}

func (s *PostService) CreatePostService(content string, r *http.Request) error {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	vars := mux.Vars(r)
	courseID := vars["id"]
	if courseID == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Course ID is required",
		}
	}

	return s.PostStorage.CreatePost(courseID, userID, content)
}
