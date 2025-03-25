package handlers

import (
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"net/http"
)

type AttachmentHandler struct {
	AttachmentService *services.AttachmentService
}

func NewAttachmentHandler(service *services.AttachmentService) *AttachmentHandler {
	return &AttachmentHandler{AttachmentService: service}
}

func (h *AttachmentHandler) GetAllAttachmentsForCourseHandler(w http.ResponseWriter, r *http.Request) error {
	attachments, err := h.AttachmentService.GetAllAttachmentsForCourse(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, attachments)
}
