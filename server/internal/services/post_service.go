package services

import (
	"course-flow/internal/storage"
	"course-flow/internal/utils"
	"net/http"

	"github.com/gorilla/mux"
)

type PostService struct {
	PostStorage       *storage.PostStorage
	AttachmentService *AttachmentService
}

func NewPostService(
	postStorage *storage.PostStorage,
	attachmentService *AttachmentService,
) *PostService {
	return &PostService{
		PostStorage:       postStorage,
		AttachmentService: attachmentService,
	}
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

	postID, err := s.PostStorage.CreatePost(courseID, userID, content)
	if err != nil {
		return err
	}

	if r.MultipartForm != nil && r.MultipartForm.File != nil {
		files := r.MultipartForm.File["attachments"]
		if len(files) > 0 {
			_, err := s.AttachmentService.AddAttachmentsToPost(postID, userID, files)
			if err != nil {
				// Delete the post if file uploading fails
				return err
			}

		}
	}

	return nil
}
