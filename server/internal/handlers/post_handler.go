package handlers

import (
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"net/http"
)

type PostHandler struct {
	postService *services.PostService
}

func NewPostHandler(postService *services.PostService) *PostHandler {
	return &PostHandler{postService: postService}
}

func (h *PostHandler) DeletePostHandler(w http.ResponseWriter, r *http.Request) error {
	err := h.postService.DeletePost(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Post deleted successfully"})
}

func (h *PostHandler) CreateNewPostHandler(w http.ResponseWriter, r *http.Request) error {
	// Parse the multipart form data (20MB max size)
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Failed to parse form data: " + err.Error(),
		}
	}

	content := r.FormValue("content")
	if content == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Content is required field",
		}
	}

	if err := h.postService.CreatePostService(content, r); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "Post created successfully"})
}
