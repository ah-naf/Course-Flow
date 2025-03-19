package storage

import (
	"course-flow/internal/models"
	"course-flow/internal/utils"
	"database/sql"
)

type CourseMemberStorage struct {
	DB *sql.DB
}

func NewCourseMemberStorage(db *sql.DB) *CourseMemberStorage {
	return &CourseMemberStorage{
		DB: db,
	}
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
