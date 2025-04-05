package handlers

import (
	"course-flow/internal/notifications"
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"encoding/json"
	"log"
	"net/http"
)

type CourseMemberHandler struct {
	CourseMemberService *services.CourseMemberService
	roleChangedNotifier *notifications.RoleChangedNotifier
}

func NewCourseMemberHandler(cmSerivces *services.CourseMemberService, roleChangedNotifier *notifications.RoleChangedNotifier) *CourseMemberHandler {
	return &CourseMemberHandler{
		CourseMemberService: cmSerivces,
		roleChangedNotifier: roleChangedNotifier,
	}
}

func (h *CourseMemberHandler) ChangeRoleHandler(w http.ResponseWriter, r *http.Request) error {
	var req struct {
		MemberID string `json:"member_id"`
		Role     int    `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	classID, err := h.CourseMemberService.ChangeRole(req.MemberID, req.Role, r)
	if err != nil {
		return err
	}

	if err := h.roleChangedNotifier.Notify(classID, req.MemberID, req.Role); err != nil {
		log.Fatal(err)
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Role changed successfully"})
}

func (h *CourseMemberHandler) GetAllMemberHandler(w http.ResponseWriter, r *http.Request) error {
	members, err := h.CourseMemberService.GetAllMember(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, members)
}
