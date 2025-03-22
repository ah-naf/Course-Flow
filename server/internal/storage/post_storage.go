package storage

import (
	"course-flow/internal/utils"
	"database/sql"
	"net/http"
	"time"
)

type PostStorage struct {
	DB *sql.DB
}

func NewPostStorage(db *sql.DB) *PostStorage {
	return &PostStorage{DB: db}
}

func (s *PostStorage) DeletePost(courseID, postID, userID string) error {
	// First, check if the course exists and get admin ID
	adminQuery := `
		SELECT admin_id 
		FROM courses 
		WHERE id = $1
	`
	var adminID string
	err := s.DB.QueryRow(adminQuery, courseID).Scan(&adminID)
	if err != nil {
		if err == sql.ErrNoRows {
			return &utils.ApiError{
				Code:    http.StatusNotFound,
				Message: "Course not found",
			}
		}
		return err
	}

	// Check if user is either the admin or the post author
	authorQuery := `
		SELECT user_id 
		FROM posts 
		WHERE id = $1 AND course_id = $2
	`
	var postAuthorID string
	err = s.DB.QueryRow(authorQuery, postID, courseID).Scan(&postAuthorID)
	if err != nil {
		if err == sql.ErrNoRows {
			return &utils.ApiError{
				Code:    http.StatusNotFound,
				Message: "Post not found",
			}
		}
		return err
	}

	// Check if user is neither admin nor author
	if userID != adminID && userID != postAuthorID {
		return &utils.ApiError{
			Code:    http.StatusForbidden,
			Message: "Only the course admin or post author can delete this post",
		}
	}

	// Perform the deletion
	deleteQuery := `
		DELETE FROM posts 
		WHERE id = $1 
		AND course_id = $2
	`
	result, err := s.DB.Exec(deleteQuery, postID, courseID)
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
			Message: "Post not found",
		}
	}

	return nil
}

func (s *PostStorage) CreatePost(courseID, userID, content string) (string, error) {
	// First, check if user is the course admin
	courseQuery := `
		SELECT admin_id, post_permission 
		FROM courses 
		WHERE id = $1
	`
	var adminID string
	var postPermission int
	err := s.DB.QueryRow(courseQuery, courseID).Scan(&adminID, &postPermission)
	if err != nil {
		return "", err
	}

	if adminID != userID {
		// If not admin, check role in course_members
		roleQuery := `
			SELECT role FROM course_members
			WHERE course_id = $1 AND user_id = $2
		`

		var currentUserRole int
		err = s.DB.QueryRow(roleQuery, courseID, userID).Scan(&currentUserRole)
		if err != nil {
			if err == sql.ErrNoRows {
				return "", &utils.ApiError{
					Code:    http.StatusForbidden,
					Message: "You are not a member of this course",
				}
			}
			return "", err
		}

		// Check if user's role meets the course's post_permission requirement
		if currentUserRole < postPermission {
			return "", &utils.ApiError{
				Code:    http.StatusForbidden,
				Message: "You do not have permission to post in this course",
			}
		}
	}

	query := `
		INSERT INTO posts (course_id, user_id, content, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5) RETURNING id
	`
	var postID string
	now := time.Now().UTC() // Use UTC for consistency
	err = s.DB.QueryRow(query, courseID, userID, content, now, now).Scan(&postID)
	if err != nil {
		return "", err
	}

	if postID == "" {
		return "", &utils.ApiError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create post",
		}
	}
	return postID, nil
}
