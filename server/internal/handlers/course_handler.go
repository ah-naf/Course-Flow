package handlers

import (
	"course-flow/internal/models"
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

type CourseHandler struct {
	Service *services.CourseService
}

func NewCourseHandler(service *services.CourseService) *CourseHandler {
	return &CourseHandler{Service: service}
}

func (h *CourseHandler) UpdateCourseSettingHandler(w http.ResponseWriter, r *http.Request) error {
	// Parse the multipart form data (20MB max size)
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Failed to parse form data: " + err.Error(),
		}
	}

	var courseReq models.CoursePreviewResponse

	// Get form values
	courseReq.Name = r.FormValue("name")
	courseReq.Description = r.FormValue("description")
	courseReq.BackgroundColor = r.FormValue("background_color")

	isPrivateStr := r.FormValue("is_private")
	isPrivate, err := strconv.ParseBool(isPrivateStr)
	if err != nil {
		log.Printf("Invalid is_private value: %v, defaulting to false", err)
		isPrivate = false // Default to false if invalid
	}
	courseReq.IsPrivate = isPrivate

	postPermissionStr := r.FormValue("post_permission")
	postPermission, err := strconv.Atoi(postPermissionStr)
	if err != nil {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "Invalid post permission type"}
	}
	courseReq.PostPermission = postPermission

	if courseReq.Name == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Name is required field",
		}
	}

	if err := h.Service.UpdateCourseSetting(&courseReq, r); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "Successfully updated the class settings."})
}

func (h *CourseHandler) CoursePreviewHandler(w http.ResponseWriter, r *http.Request) error {
	preview, err := h.Service.CoursePreview(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, preview)
}

func (h *CourseHandler) LeaveCourseHandler(w http.ResponseWriter, r *http.Request) error {
	err := h.Service.LeaveCourse(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "You have successfully left the course."})
}

func (h *CourseHandler) DeleteCourseHandler(w http.ResponseWriter, r *http.Request) error {
	err := h.Service.DeleteCourse(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Course deleted successfully!"})
}

func (h *CourseHandler) RestoreArchivedCourseHandler(w http.ResponseWriter, r *http.Request) error {
	var req struct {
		CourseID string `json:"course_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	err := h.Service.RestoreArchivedCourse(req.CourseID, r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Course restored successfully!"})
}

func (h *CourseHandler) ArchiveCourseHandler(w http.ResponseWriter, r *http.Request) error {
	var req struct {
		CourseID string `json:"course_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	err := h.Service.ArchiveCourse(req.CourseID, r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Course archieved successfully!"})
}

func (h *CourseHandler) GetCourseForSingleUserHandler(w http.ResponseWriter, r *http.Request) error {
	courses, err := h.Service.GetCourseOfSingleUser(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, courses)
}

func (h *CourseHandler) JoinCourseHandler(w http.ResponseWriter, r *http.Request) error {
	var joinReq struct {
		JoinCode string `json:"course_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&joinReq); err != nil {
		return err
	}

	if err := h.Service.JoinCourseService(joinReq.JoinCode, r); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "You have successfully joined the class."})
}

// GetCoursesByInstructorHandler handles GET requests to fetch courses for a given instructor.
func (h *CourseHandler) GetCoursesByInstructorHandler(w http.ResponseWriter, r *http.Request) error {
	courses, err := h.Service.GetCoursesByInstructor(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, courses)
}

func (h *CourseHandler) CreateCourseHandler(w http.ResponseWriter, r *http.Request) error {
	// Parse the multipart form data (20MB max size)
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Failed to parse form data: " + err.Error(),
		}
	}

	var courseReq models.Course

	// Get form values
	courseReq.JoinCode = r.FormValue("id")
	courseReq.Name = r.FormValue("name")
	courseReq.Description = r.FormValue("description")

	if courseReq.JoinCode == "" || courseReq.Name == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "ID and Name are required fields",
		}
	}

	if err := h.Service.CreateNewCourseService(&courseReq, r); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "Successfully created new class."})
}
