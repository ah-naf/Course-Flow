package storage

import (
	"collab-editor/internal/models"
	"database/sql"
	"fmt"
)

type CourseStorage struct {
	DB *sql.DB
}

func NewCourseStorage(db *sql.DB) *CourseStorage {
	return &CourseStorage{
		DB: db,
	}
}

func (s *CourseStorage) CreateNewCourse(course *models.Course) error {
	query := `
	INSERT INTO courses (
		name,
		description,
		instructor_id,
		background_color,
		cover_pic,
		join_code,
		is_private,
		archived,
		post_permission,
		created_at,
		updated_at
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	RETURNING id
	`
	// Use QueryRow to execute the insert and scan the returned id.
	err := s.DB.QueryRow(query,
		course.Name,
		course.Description,
		course.InstructorID,
		course.BackgroundColor,
		course.CoverPic,
		course.JoinCode,
		course.IsPrivate,
		course.IsArchived,
		course.PostPermission,
		course.CreatedAt,
		course.UpdatedAt,
	).Scan(&course.ID)
	if err != nil {
		return fmt.Errorf("failed to create course: %w", err)
	}
	return nil
}
