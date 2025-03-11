package storage

import (
	"collab-editor/internal/models"
	"collab-editor/internal/utils"
	"database/sql"
	"fmt"
	"net/http"

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

func (s *CourseStorage) GetCourseByUserID(userID string) ([]*models.CourseListResponse, error) {
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
			cm.role
        FROM courses AS c 
        JOIN users AS u ON c.admin_id = u.id
        JOIN course_members AS cm ON c.id = cm.course_id
        WHERE cm.user_id = $1
        AND c.archived = FALSE
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
			&course.Role,
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
		WHERE c.admin_id = $1
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
