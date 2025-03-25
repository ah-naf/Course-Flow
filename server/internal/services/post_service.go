package services

import (
	"course-flow/internal/models"
	"course-flow/internal/storage"
	"course-flow/internal/utils"
	"fmt"
	"net/http"
	"strings"
	"sync"

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

func (s *PostService) EditPost(r *http.Request) error {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		return err
	}

	vars := mux.Vars(r)
	postID := vars["id"]
	if postID == "" {
		return &utils.ApiError{Code: http.StatusNotFound, Message: "Post ID is required"}
	}

	content := r.FormValue("content")
	existingAttachmentIDs := strings.Split(r.FormValue("docs"), ",")

	for i := range existingAttachmentIDs {
		existingAttachmentIDs[i] = strings.TrimSpace(existingAttachmentIDs[i])
	}

	currentAttachment, err := s.AttachmentService.GetAllAttachmentsForPosts(postID, r)
	if err != nil {
		return err
	}

	existingIDsMap := make(map[string]struct{}, len(existingAttachmentIDs))
	for _, id := range existingAttachmentIDs {
		existingIDsMap[id] = struct{}{}
	}

	var attachmentsToDelete []string
	for _, atch := range currentAttachment {
		if _, exists := existingIDsMap[atch.ID]; !exists {
			attachmentsToDelete = append(attachmentsToDelete, atch.ID)
		}
	}

	if len(attachmentsToDelete) > 0 {
		var wg sync.WaitGroup
		errChan := make(chan error, len(attachmentsToDelete))
		concurrencyLimit := make(chan struct{}, 10)

		for _, attachmentID := range attachmentsToDelete {
			wg.Add(1)
			concurrencyLimit <- struct{}{}

			go func(id string) {
				defer wg.Done()
				defer func() {
					<-concurrencyLimit
				}()

				if err := s.AttachmentService.DeleteAttachment(id, r); err != nil {
					errChan <- fmt.Errorf("%s: %v", id, err)
				}
			}(attachmentID)
		}

		wg.Wait()
		close(errChan)

		var deleteErrors []string
		for err := range errChan {
			deleteErrors = append(deleteErrors, err.Error())
		}
		if len(deleteErrors) > 0 {
			// Determine the appropriate status code based on error messages
			var statusCode int
			combinedMessage := strings.Join(deleteErrors, "; ")

			// Check for "not authorized" in any error message
			hasNotAuthorized := false
			hasNotFound := false
			for _, errMsg := range deleteErrors {
				errMsgLower := strings.ToLower(errMsg)
				if strings.Contains(errMsgLower, "not authorized") {
					hasNotAuthorized = true
					break
				}
				if strings.Contains(errMsgLower, "not found") {
					hasNotFound = true
				}
			}

			// Set status code based on the error content
			if hasNotAuthorized {
				statusCode = http.StatusUnauthorized // 401
			} else if hasNotFound {
				statusCode = http.StatusNotFound // 404
			} else {
				statusCode = http.StatusInternalServerError // 500
			}

			return &utils.ApiError{
				Code:    statusCode,
				Message: combinedMessage,
			}
		}

	}

	if err := s.PostStorage.EditPost(postID, userID, content); err != nil {
		return err
	}

	if r.MultipartForm != nil && r.MultipartForm.File != nil {
		files := r.MultipartForm.File["attachments"]
		if len(files) > 0 {
			_, err := s.AttachmentService.AddAttachmentsToPost(postID, userID, files)
			if err != nil {
				return err
			}

		}
	}

	return nil
}

func (s *PostService) GetAllPost(r *http.Request) ([]models.PostResponse, error) {
	vars := mux.Vars(r)
	courseID := vars["id"]
	if courseID == "" {
		return nil, &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Course ID is required",
		}
	}

	return s.PostStorage.GetAllPost(courseID)
}

func (s *PostService) DeletePost(r *http.Request) error {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	vars := mux.Vars(r)
	postID := vars["id"]
	if postID == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Post ID is required",
		}
	}

	courseID := r.URL.Query().Get("course_id")
	if courseID == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Course ID is required",
		}
	}

	return s.PostStorage.DeletePost(courseID, postID, userID)
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

				if err := s.PostStorage.DeletePost(courseID, postID, userID); err != nil {
					return err
				}
				return err
			}

		}
	}

	return nil
}
