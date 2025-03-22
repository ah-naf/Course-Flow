package services

import (
	"course-flow/internal/models"
	"course-flow/internal/storage"
	"mime/multipart"
	"time"
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

// AddAttachmentsToPost saves files using DocumentService and creates attachment records
func (s *AttachmentService) AddAttachmentsToPost(postID string, userID string, fileHeaders []*multipart.FileHeader) ([]models.Attachment, error) {
	// First, save files using existing DocumentService
	documents, err := s.DocumentService.SaveFilesToLocal(fileHeaders, userID)
	if err != nil {
		return nil, err
	}

	// Then create attachments that reference these documents
	var attachments []models.Attachment
	for _, doc := range documents {
		attachment := models.Attachment{
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
