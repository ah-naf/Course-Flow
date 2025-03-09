package handlers

import (
	"collab-editor/internal/models"
	"collab-editor/internal/services"
	"collab-editor/internal/utils"
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
