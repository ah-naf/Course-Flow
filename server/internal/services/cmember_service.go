package services

import (
	"course-flow/internal/models"
	"course-flow/internal/storage"
	"course-flow/internal/utils"
	"net/http"

	"github.com/gorilla/mux"
)

type CourseMemberService struct {
	CourseMemberStorage *storage.CourseMemberStorage
}

func NewCourseMemberService(cmStorage *storage.CourseMemberStorage) *CourseMemberService {
	return &CourseMemberService{
		CourseMemberStorage: cmStorage,
	}
}

func (s *CourseMemberService) GetAllMember(r *http.Request) ([]*models.CourseMember, error) {
	vars := mux.Vars(r)
	courseID := vars["id"]
	if courseID == "" {
		return nil, &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Course ID is required",
		}
	}
	return s.CourseMemberStorage.GetAllMember(courseID)
}
