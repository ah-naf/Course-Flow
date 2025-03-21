package storage

import (
	"course-flow/internal/models"
	"course-flow/internal/utils"
	"database/sql"
	"net/http"
)

type CourseMemberStorage struct {
	DB *sql.DB
}

func NewCourseMemberStorage(db *sql.DB) *CourseMemberStorage {
	return &CourseMemberStorage{
		DB: db,
	}
}

func (s *CourseMemberStorage) ChangeRole(courseID, userID, memberID string, role int) error {
	// Check if user is admin or has sufficient role
	var currentUserRole int

	// First, check if user is the course admin
	adminQuery := `SELECT admin_id FROM courses WHERE id = $1`
	var adminID string
	err := s.DB.QueryRow(adminQuery, courseID).Scan(&adminID)
	if err != nil {
		return err
	}
	if adminID != userID {
		// If not admin, check role in course_members
		roleQuery := `
			SELECT role FROM course_members
			WHERE course_id = $1 AND user_id = $2
		`
		err = s.DB.QueryRow(roleQuery, courseID, userID).Scan(&currentUserRole)
		if err != nil {
			if err == sql.ErrNoRows {
				return &utils.ApiError{
					Code:    http.StatusForbidden,
					Message: "You are not a member of this course",
				}
			}
			return err
		}

		// Check if user has sufficient privileges
		if currentUserRole < role {
			return &utils.ApiError{
				Code:    http.StatusForbidden,
				Message: "You are not authorized to perform this action",
			}
		}
	}

	// Update the member's role
	query := `
		UPDATE course_members
		SET role = $1
		WHERE course_id = $2 AND user_id = $3
	`
	result, err := s.DB.Exec(query, role, courseID, memberID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return &utils.ApiError{
			Code:    http.StatusNotFound,
			Message: "User not found in this course",
		}
	}

	return nil
}

func (s *CourseMemberStorage) GetAllMember(courseID string) ([]*models.CourseMember, error) {
	query := `
		SELECT 
			u.id,
			u.email,
			u.username,
			u.first_name,
			u.last_name,
			u.avatar,
			cm.joined_at,
			cm.role
		FROM course_members cm
		JOIN users u ON cm.user_id = u.id
		WHERE cm.course_id = $1
	`

	rows, err := s.DB.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*models.CourseMember
	for rows.Next() {
		var member models.CourseMember
		if err := rows.Scan(
			&member.ID,
			&member.Email,
			&member.Username,
			&member.FirstName,
			&member.LastName,
			&member.Avatar,
			&member.CreatedAt,
			&member.Role,
		); err != nil {
			return nil, err
		}

		member.Avatar = utils.NormalizeMedia(member.Avatar)
		members = append(members, &member)
	}

	return members, nil
}
