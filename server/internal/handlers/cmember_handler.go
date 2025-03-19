package handlers

import (
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"net/http"
)

type CourseMemberHandler struct {
	CourseMemberService *services.CourseMemberService
}

func NewCourseMemberHandler(cmSerivces *services.CourseMemberService) *CourseMemberHandler {
	return &CourseMemberHandler{
		CourseMemberService: cmSerivces,
	}
}

func (h *CourseMemberHandler) GetAllMemberHandler(w http.ResponseWriter, r *http.Request) error {
	members, err := h.CourseMemberService.GetAllMember(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, members)
}
