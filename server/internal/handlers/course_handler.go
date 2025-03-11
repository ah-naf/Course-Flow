package handlers

import (
	"course-flow/internal/models"
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"encoding/json"
	"log"
	"net/http"
)

type CourseHandler struct {
	Service *services.CourseService
}

func NewCourseHandler(service *services.CourseService) *CourseHandler {
	return &CourseHandler{Service: service}
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

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "You have successfully join the class."})
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
	var courseReq models.Course
	if err := json.NewDecoder(r.Body).Decode(&courseReq); err != nil {
		log.Fatal(err)
		return err
	}

	if err := h.Service.CreateNewCourseService(&courseReq, r); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "Successfully created new Class."})
}
