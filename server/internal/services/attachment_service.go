package services

import (
	"course-flow/internal/types"
	"course-flow/internal/storage"
	"course-flow/internal/utils"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

type AttachmentService struct {
	AttachmentStorage *storage.AttachmentStorage
	DocumentService   *DocumentService
}

func NewAttachmentService(attachmentStorage *storage.AttachmentStorage, documentService *DocumentService) *AttachmentService {
	return &AttachmentService{
		AttachmentStorage: attachmentStorage,
		DocumentService:   documentService,
	}
}

func (s *AttachmentService) DeleteAttachment(attachmentID string, r *http.Request) error {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	return s.AttachmentStorage.DeleteAttachment(attachmentID, userID)
}

func (s *AttachmentService) GetAllAttachmentsForPosts(postID string, r *http.Request) ([]types.Attachment, error) {
	ctx := r.Context()
	_, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	return s.AttachmentStorage.GetAllAttachmentsForPost(postID)
}

func (s *AttachmentService) GetAllAttachmentsForCourse(r *http.Request) ([]types.Attachment, error) {
	ctx := r.Context()
	_, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	vars := mux.Vars(r)
	courseID := vars["id"]
	if courseID == "" {
		return nil, &utils.ApiError{Code: http.StatusNotFound, Message: "Course ID not found"}
	}

	return s.AttachmentStorage.GetAllAttachmentsForCourse(courseID)
}

// AddAttachmentsToPost saves files using DocumentService and creates attachment records
func (s *AttachmentService) AddAttachmentsToPost(postID string, userID string, fileHeaders []*multipart.FileHeader) ([]types.Attachment, error) {
	// First, save files using existing DocumentService
	documents, err := s.DocumentService.SaveFilesToLocal(fileHeaders, userID)
	if err != nil {
		return nil, err
	}

	// Then create attachments that reference these documents
	var attachments []types.Attachment
	for _, doc := range documents {
		attachment := types.Attachment{
			PostID:     postID,
			DocumentID: doc.ID,
			UploadedBy: userID,
			UploadDate: time.Now(),
			Document:   &doc, // Include the document for convenience
		}

		if err := s.AttachmentStorage.SaveAttachment(&attachment); err != nil {
			return nil, err
		}

		attachments = append(attachments, attachment)
	}

	return attachments, nil
}
