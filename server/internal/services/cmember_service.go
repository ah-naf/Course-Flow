package services

import (
	"course-flow/internal/types"
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

func (s *CourseMemberService) ChangeRole(memberID string, role int, r *http.Request) (string, error) {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return "", err
	}

	vars := mux.Vars(r)
	courseID := vars["id"]
	if courseID == "" {
		return "", &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Course ID is required",
		}
	}

	return courseID, s.CourseMemberStorage.ChangeRole(courseID, userID, memberID, role)
}

func (s *CourseMemberService) GetAllMember(r *http.Request) ([]*types.CourseMember, error) {
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
