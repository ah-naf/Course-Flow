package handlers

import (
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"encoding/json"
	"net/http"
)

type PostHandler struct {
	postService *services.PostService
}

func NewPostHandler(postService *services.PostService) *PostHandler {
	return &PostHandler{postService: postService}
}

func (h *PostHandler) AddCommentHandler(w http.ResponseWriter, r *http.Request) error {
	var req struct {
		Comment string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	err := h.postService.AddComment(req.Comment, r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "Comment created successfully"})
}

func (h *PostHandler) EditPostHandler(w http.ResponseWriter, r *http.Request) error {
	// Parse the multipart form data (20MB max size)
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Failed to parse form data: " + err.Error(),
		}
	}

	return h.postService.EditPost(r)
}

func (h *PostHandler) GetAllPostHandler(w http.ResponseWriter, r *http.Request) error {
	posts, err := h.postService.GetAllPost(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, posts)
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
