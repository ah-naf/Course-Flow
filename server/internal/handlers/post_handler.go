package handlers

import (
	"course-flow/internal/notifications"
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"encoding/json"
	"log"
	"net/http"
)

type PostHandler struct {
	postService            *services.PostService
	postCreatedNotifier    *notifications.PostCreatedNotifier
	commentCreatedNotifier *notifications.CommentAddedNotifier
}

func NewPostHandler(postService *services.PostService, postCreatedNotifier *notifications.PostCreatedNotifier, commentAddedNotifer *notifications.CommentAddedNotifier) *PostHandler {
	return &PostHandler{
		postService:            postService,
		postCreatedNotifier:    postCreatedNotifier,
		commentCreatedNotifier: commentAddedNotifer,
	}
}

func (h *PostHandler) DeleteCommentHandler(w http.ResponseWriter, r *http.Request) error {
	err := h.postService.DeleteComment(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Comment deleted successfully"})
}

func (h *PostHandler) EditommentHandler(w http.ResponseWriter, r *http.Request) error {
	var req struct {
		Comment string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	err := h.postService.EditComment(req.Comment, r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Comment editted successfully"})
}

func (h *PostHandler) GetCommentForPostHandler(w http.ResponseWriter, r *http.Request) error {
	comments, err := h.postService.GetCommentForPost(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, comments)
}

func (h *PostHandler) AddCommentHandler(w http.ResponseWriter, r *http.Request) error {
	var req struct {
		Comment string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	payload, err := h.postService.AddComment(req.Comment, r)
	if err != nil {
		return err
	}

	if err := h.commentCreatedNotifier.Notify(payload.ClassID, payload.PostID, payload.UserID); err != nil {
		log.Fatal(err)
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

	payload, err := h.postService.CreatePostService(content, r)
	if err != nil {
		return err
	}

	if err := h.postCreatedNotifier.Notify(payload.ClassID, content, payload.UserID); err != nil {
		log.Fatal(err)
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "Post created successfully"})
}
