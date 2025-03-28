package storage

import (
	"course-flow/internal/types"
	"course-flow/internal/utils"
	"database/sql"
	"fmt"
	"log"
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

func (s *CourseStorage) UpdateCourseSetting(userID string, course *types.CoursePreviewResponse) error {
	var err error
	tx, err := s.DB.Begin()
	if err != nil {
		return err
	}

	var result sql.Result
	if course.CoverPic != "" {
		query := `
		UPDATE courses
		SET name = $3, description = $4, cover_pic = $5, background_color = $6, is_private = $7, post_permission = $8, updated_at = $9
		WHERE id = $1 AND admin_id = $2 AND archived = FALSE
		`
		result, err = tx.Exec(query, course.ID, userID, course.Name, course.Description, course.CoverPic, course.BackgroundColor, course.IsPrivate, course.PostPermission, course.UpdatedAt)
	} else {
		query := `
		UPDATE courses
		SET name = $3, description = $4, background_color = $5, is_private = $6, post_permission = $7, updated_at = $8
		WHERE id = $1 AND admin_id = $2 AND archived = FALSE
		`
		result, err = tx.Exec(query, course.ID, userID, course.Name, course.Description, course.BackgroundColor, course.IsPrivate, course.PostPermission, course.UpdatedAt)
	}

	if err != nil {
		tx.Rollback()
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		tx.Rollback()
		return &utils.ApiError{
			Code:    404,
			Message: "course not found or user not authorized to update it",
		}
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return err
	}

	log.Printf("Successfully updated course settings for course %s by user %s", course.ID, userID)
	return nil
}

func (s *CourseStorage) CoursePreview(joinCode, userID string, showRole bool) (*types.CoursePreviewResponse, error) {
	var query string
	var row *sql.Row
	var err error
	var preview types.CoursePreviewResponse

	if showRole && userID != "" {
		query = `
			SELECT 
				c.id, 
				c.name, 
				c.description, 
				c.background_color, 
				c.cover_pic, 
				c.join_code, 
				c.post_permission, 
				c.created_at, 
				c.updated_at,
				u.id AS admin_id,
				u.username AS admin_username,
				u.first_name AS admin_first_name,
				u.last_name AS admin_last_name,
				u.avatar AS admin_avatar,
				(SELECT COUNT(*) FROM course_members WHERE course_id = c.id) AS total_members,
				c.archived,
				c.is_private,
				cm.role
			FROM courses c
			LEFT JOIN users u ON c.admin_id = u.id
			INNER JOIN course_members cm ON cm.course_id = c.id AND cm.user_id = $2
			WHERE c.join_code = $1 
			AND c.archived = FALSE
		`
		row = s.DB.QueryRow(query, joinCode, userID)
		err = row.Scan(
			&preview.ID,
			&preview.Name,
			&preview.Description,
			&preview.BackgroundColor,
			&preview.CoverPic,
			&preview.JoinCode,
			&preview.PostPermission,
			&preview.CreatedAt,
			&preview.UpdatedAt,
			&preview.Admin.ID,
			&preview.Admin.Username,
			&preview.Admin.FirstName,
			&preview.Admin.LastName,
			&preview.Admin.Avatar,
			&preview.TotalMembers,
			&preview.IsArchived,
			&preview.IsPrivate,
			&preview.Role,
		)
	} else {
		query = `
			SELECT 
				c.id, 
				c.name, 
				c.description, 
				c.background_color, 
				c.cover_pic, 
				c.join_code, 
				c.post_permission, 
				c.created_at, 
				c.updated_at,
				u.id AS admin_id,
				u.username AS admin_username,
				u.first_name AS admin_first_name,
				u.last_name AS admin_last_name,
				u.avatar AS admin_avatar,
				(SELECT COUNT(*) FROM course_members WHERE course_id = c.id) AS total_members,
				c.archived
			FROM courses c
			LEFT JOIN users u ON c.admin_id = u.id
			WHERE c.join_code = $1 
			AND c.is_private = FALSE 
			AND c.archived = FALSE
		`
		row = s.DB.QueryRow(query, joinCode)
		err = row.Scan(
			&preview.ID,
			&preview.Name,
			&preview.Description,
			&preview.BackgroundColor,
			&preview.CoverPic,
			&preview.JoinCode,
			&preview.PostPermission,
			&preview.CreatedAt,
			&preview.UpdatedAt,
			&preview.Admin.ID,
			&preview.Admin.Username,
			&preview.Admin.FirstName,
			&preview.Admin.LastName,
			&preview.Admin.Avatar,
			&preview.TotalMembers,
			&preview.IsArchived,
			&preview.IsPrivate,
		)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, &utils.ApiError{Code: http.StatusNotFound, Message: "course not found or not accessible"}
		}
		return nil, fmt.Errorf("error fetching course preview: %w", err)
	}

	preview.CoverPic = utils.NormalizeMedia(preview.CoverPic)
	preview.Admin.Avatar = utils.NormalizeMedia(preview.Admin.Avatar)

	return &preview, nil
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
		return fmt.Errorf("Error checking if user is admin: %v", err)
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

	rowsAffected, _ := result.RowsAffected()

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

	log.Printf("User %s successfully left course %s", userID, courseID)
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
		return fmt.Errorf("Error deleting course: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
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

	log.Printf("Successfully deleted course %s by admin %s", courseID, adminID)
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
		return fmt.Errorf("Error archiving course: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return &utils.ApiError{
			Code:    404,
			Message: "course not found or user not authorized to archive/restore it",
		}
	}

	log.Printf("Successfully updated archive status for course %s to %v by admin %s", courseID, archived, adminID)
	return nil
}

func (s *CourseStorage) GetCourseByUserID(userID string, archieved bool) ([]*types.CourseListResponse, error) {
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
			c.updated_at,
			c.join_code
        FROM courses AS c 
        JOIN users AS u ON c.admin_id = u.id
        JOIN course_members AS cm ON c.id = cm.course_id
        WHERE cm.user_id = $1
        AND c.archived = $2
    `

	rows, err := s.DB.Query(query, userID, archieved)
	if err != nil {
		return nil, fmt.Errorf("Error getting course by userid: %v", err)
	}
	defer rows.Close()

	var courses []*types.CourseListResponse
	for rows.Next() {
		var course types.CourseListResponse
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
			&course.JoinCode,
		); err != nil {
			return nil, fmt.Errorf("Error scanning get course: %v", err)
		}
		course.CoverPic = utils.NormalizeMedia(course.CoverPic)
		course.Admin.Avatar = utils.NormalizeMedia(course.Admin.Avatar)
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
	err = s.AddCourseMember(courseID, userID, 0) // 0 for member
	if err != nil {
		return err
	}

	log.Printf("User %s successfully joined course %s", userID, courseID)
	return nil
}

func (s *CourseStorage) GetCoursesByInstructor(userID string) ([]*types.CourseListResponse, error) {
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
		return nil, fmt.Errorf("Error getting course by instructor: %v", err)
	}
	defer rows.Close()

	var courses []*types.CourseListResponse
	for rows.Next() {
		var course types.CourseListResponse
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
			return nil, fmt.Errorf("Error scanning course by instructor: %v", err)
		}
		course.CoverPic = utils.NormalizeMedia(course.CoverPic)
		course.Admin.Avatar = utils.NormalizeMedia(course.Admin.Avatar)
		courses = append(courses, &course)
	}
	return courses, nil
}

func (s *CourseStorage) CreateNewCourse(course *types.Course) error {
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
		return fmt.Errorf("Error getting newly added course id: %v", err)
	}

	err = s.AddCourseMember(course.ID, course.AdminID, 3) // 3 for instructor
	if err != nil {
		return err
	}

	log.Printf("Successfully created new course %s with join code %s", course.ID, course.JoinCode)
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
		return "", fmt.Errorf("Error checking if course exist: %v", err)
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
		return false, fmt.Errorf("Error checking course membership: %v", err)
	}

	return isMember, nil
}

// AddCourseMember inserts a new member into a course with the specified role
func (s *CourseStorage) AddCourseMember(courseID, userID string, role int) error {
	insertQuery := `
        INSERT INTO course_members (course_id, user_id, role)
        VALUES ($1, $2, $3)
    `

	_, err := s.DB.Exec(insertQuery, courseID, userID, role)
	if err != nil {
		return fmt.Errorf("Error inserting course member: %v", err)
	}

	log.Printf("Successfully added course member %s to course %s with role %d", userID, courseID, role)
	return nil
}
