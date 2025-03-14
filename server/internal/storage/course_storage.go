package storage

import (
	"course-flow/internal/models"
	"course-flow/internal/utils"
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/lib/pq"
)

type CourseStorage struct {
	DB *sql.DB
}

func NewCourseStorage(db *sql.DB) *CourseStorage {
	return &CourseStorage{
		DB: db,
	}
}

func (s *CourseStorage) LeaveCourse(courseID, userID string) error {
	// First check if the user is the admin of the course
	adminQuery := `
		SELECT EXISTS (
			SELECT 1 FROM courses 
			WHERE id = $1 AND admin_id = $2
		)
	`
	var isAdmin bool
	err := s.DB.QueryRow(adminQuery, courseID, userID).Scan(&isAdmin)
	if err != nil {
		return err
	}

	// If user is admin, they cannot leave the course
	if isAdmin {
		return &utils.ApiError{
			Code:    http.StatusForbidden,
			Message: "As the course admin, you cannot leave the course. You must either delete or transfer ownership first.",
		}
	}

	// Proceed with leaving the course if user is not the admin
	tx, err := s.DB.Begin()
	if err != nil {
		return err
	}

	query := `
		DELETE FROM course_members
		WHERE course_id = $1 AND user_id = $2
	`

	result, err := tx.Exec(query, courseID, userID)
	if err != nil {
		tx.Rollback()
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		tx.Rollback()
		return err
	}

	if rowsAffected == 0 {
		tx.Rollback()
		return &utils.ApiError{
			Code:    http.StatusNotFound,
			Message: "You are not a member of this course or the course does not exist.",
		}
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (s *CourseStorage) DeleteCourse(courseID, adminID string) error {
	tx, err := s.DB.Begin()
	if err != nil {
		return err
	}

	query := `
		DELETE FROM courses
		WHERE id = $1 AND admin_id = $2
	`

	result, err := tx.Exec(query, courseID, adminID)
	if err != nil {
		tx.Rollback()
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		tx.Rollback()
		return err
	}
	if rowsAffected == 0 {
		tx.Rollback()
		return &utils.ApiError{
			Code:    404,
			Message: "course not found or user not authorized to delete it",
		}
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (s *CourseStorage) ArchiveCourse(courseID, adminID string, archived bool) error {
	now := time.Now().UTC()
	query := `
		UPDATE courses
		SET archived = $3, updated_at = $4
		WHERE id = $1 AND admin_id = $2
	`

	result, err := s.DB.Exec(query, courseID, adminID, archived, now)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return &utils.ApiError{
			Code:    404,
			Message: "course not found or user not authorized to archive/restore it",
		}
	}

	return nil
}

func (s *CourseStorage) GetCourseByUserID(userID string, archieved bool) ([]*models.CourseListResponse, error) {
	query := `
        SELECT 
            c.id, 
            c.name, 
            c.description, 
            c.background_color, 
            c.cover_pic, 
            u.id AS admin_id, 
            u.first_name, 
            u.last_name, 
            u.avatar,
			cm.role,
			c.post_permission,
			c.created_at,
			c.updated_at
        FROM courses AS c 
        JOIN users AS u ON c.admin_id = u.id
        JOIN course_members AS cm ON c.id = cm.course_id
        WHERE cm.user_id = $1
        AND c.archived = $2
    `

	rows, err := s.DB.Query(query, userID, archieved)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []*models.CourseListResponse
	for rows.Next() {
		var course models.CourseListResponse
		if err := rows.Scan(
			&course.ID,
			&course.Name,
			&course.Description,
			&course.BackgroundColor,
			&course.CoverPic,
			&course.Admin.ID,
			&course.Admin.FirstName,
			&course.Admin.LastName,
			&course.Admin.Avatar,
			&course.Role,
			&course.PostPermission,
			&course.CreatedAt,
			&course.UpdatedAt,
		); err != nil {
			return nil, err
		}
		courses = append(courses, &course)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return courses, nil
}

func (s *CourseStorage) JoinCourse(joinCode, userID string) error {
	// Check if course exists
	courseID, err := s.CheckCourseExists(joinCode)
	if err != nil {
		return err
	}

	// Check if user is already a member
	isMember, err := s.CheckCourseMembership(courseID, userID)
	if err != nil {
		return err
	}
	if isMember {
		return &utils.ApiError{Code: http.StatusConflict, Message: "User is already a member of this course"}
	}

	// Add user as a member
	err = s.AddCourseMember(courseID, userID, "Member")
	if err != nil {
		return err
	}

	return nil
}

func (s *CourseStorage) GetCoursesByInstructor(userID string) ([]*models.CourseListResponse, error) {
	query := `
		SELECT 
			c.id, 
			c.name, 
			c.description, 
			c.background_color, 
			c.cover_pic, 
			u.id, 
			u.first_name, 
			u.last_name, 
			u.avatar 
		FROM courses AS c 
		JOIN users AS u ON c.admin_id = u.id
		WHERE c.admin_id = $1 AND c.archived = false
	`

	rows, err := s.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []*models.CourseListResponse
	for rows.Next() {
		var course models.CourseListResponse
		if err := rows.Scan(
			&course.ID,
			&course.Name,
			&course.Description,
			&course.BackgroundColor,
			&course.CoverPic,
			&course.Admin.ID,
			&course.Admin.FirstName,
			&course.Admin.LastName,
			&course.Admin.Avatar,
		); err != nil {
			return nil, err
		}
		courses = append(courses, &course)
	}
	return courses, nil
}

func (s *CourseStorage) CreateNewCourse(course *models.Course) error {
	query := `
	INSERT INTO courses (
		name,
		description,
		admin_id,
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
		course.AdminID,
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
		// Check if the error is a PostgreSQL unique constraint violation
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" && pqErr.Constraint == "unique_joincode" {
			return &utils.ApiError{Code: http.StatusConflict, Message: fmt.Sprintf("class id '%s' already exists", course.JoinCode)}
		}
		return err
	}

	err = s.AddCourseMember(course.ID, course.AdminID, "Instructor")
	return nil
}

// CheckCourseExists checks if a course exists with the given join code and is not archived
func (s *CourseStorage) CheckCourseExists(joinCode string) (string, error) {
	query := `SELECT id FROM courses WHERE join_code = $1 AND archived = FALSE`
	var courseID string

	err := s.DB.QueryRow(query, joinCode).Scan(&courseID)
	if err == sql.ErrNoRows {
		return "", &utils.ApiError{Code: http.StatusNotFound, Message: "Course not found or is archived"}
	}
	if err != nil {
		return "", err
	}

	return courseID, nil
}

// CheckCourseMembership checks if a user is already a member of a course
func (s *CourseStorage) CheckCourseMembership(courseID, userID string) (bool, error) {
	checkQuery := `
        SELECT EXISTS (
            SELECT 1 
            FROM course_members 
            WHERE course_id = $1 AND user_id = $2
        )
    `
	var isMember bool

	err := s.DB.QueryRow(checkQuery, courseID, userID).Scan(&isMember)
	if err != nil {
		return false, err
	}

	return isMember, nil
}

// AddCourseMember inserts a new member into a course with the specified role
func (s *CourseStorage) AddCourseMember(courseID, userID, role string) error {
	insertQuery := `
        INSERT INTO course_members (course_id, user_id, role)
        VALUES ($1, $2, $3)
    `

	_, err := s.DB.Exec(insertQuery, courseID, userID, role)
	if err != nil {
		return err
	}

	return nil
}
