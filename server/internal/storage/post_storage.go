package storage

import (
	"course-flow/internal/models"
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

func (s *PostStorage) GetAllPost(courseID string) ([]models.PostResponse, error) {
	query := `
	SELECT 
	    p.id, p.course_id, p.user_id, p.content, p.created_at, p.updated_at,
	    u.username, u.id, u.first_name, u.last_name, u.avatar,
	    a.id, a.post_id, a.document_id, a.uploaded_by, a.upload_date,
	    d.id, d.user_id, d.file_name, d.file_path, d.file_type, d.created_at, d.updated_at
	FROM posts p
	LEFT JOIN users u ON p.user_id = u.id
	LEFT JOIN attachments a ON p.id = a.post_id
	LEFT JOIN documents d ON a.document_id = d.id
	WHERE p.course_id = $1
	ORDER BY p.created_at DESC;
	`

	rows, err := s.DB.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Use a map to aggregate attachments with their respective posts.
	postsMap := make(map[string]*models.PostResponse)

	for rows.Next() {
		var (
			// Post fields
			pID, pCourseID, pUserID, pContent string
			pCreatedAt, pUpdatedAt            time.Time

			// User fields (nullable, as user may be null)
			uUsername, uId, uFirstName, uLastName, uAvatar sql.NullString

			// Attachment fields (may be null if no attachment exists)
			aID, aPostID, aDocumentID, aUploadedBy sql.NullString
			aUploadDate                            sql.NullTime

			// Document fields (may be null)
			dID, dUserID, dFileName, dFilePath, dFileType sql.NullString
			dCreatedAt, dUpdatedAt                        sql.NullTime
		)

		err = rows.Scan(
			&pID, &pCourseID, &pUserID, &pContent, &pCreatedAt, &pUpdatedAt,
			&uUsername, &uId, &uFirstName, &uLastName, &uAvatar,
			&aID, &aPostID, &aDocumentID, &aUploadedBy, &aUploadDate,
			&dID, &dUserID, &dFileName, &dFilePath, &dFileType, &dCreatedAt, &dUpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// If the post hasn't been added to the map yet, add it along with the user details.
		post, exists := postsMap[pID]
		if !exists {
			post = &models.PostResponse{
				Post: models.Post{
					ID:        pID,
					UserID:    pUserID,
					Content:   pContent,
					CreatedAt: pCreatedAt,
					UpdatedAt: pUpdatedAt,
				},
				User: models.User{
					Username:  uUsername.String,
					FirstName: uFirstName.String,
					LastName:  uLastName.String,
					Avatar:    utils.NormalizeMedia(uAvatar.String),
				},
				// Initialize attachments slice.
				Attachment: []models.Attachment{},
			}
			postsMap[pID] = post
		}

		// If an attachment exists (its id is non-null), append it.
		if aID.Valid {
			attachment := models.Attachment{
				ID:         aID.String,
				UploadedBy: aUploadedBy.String,
			}
			if aUploadDate.Valid {
				attachment.UploadDate = aUploadDate.Time
			}
			// If document info exists, include it.
			if dID.Valid {
				attachment.Document = &models.Document{
					ID:       dID.String,
					FileName: dFileName.String,
					FilePath: utils.NormalizeMedia(dFilePath.String),
					FileType: dFileType.String,
				}
				if dCreatedAt.Valid {
					attachment.Document.CreatedAt = dCreatedAt.Time
				}
				if dUpdatedAt.Valid {
					attachment.Document.UpdatedAt = dUpdatedAt.Time
				}
			}
			post.Attachment = append(post.Attachment, attachment)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Convert the posts map into a slice.
	posts := make([]models.PostResponse, 0, len(postsMap))
	for _, post := range postsMap {
		posts = append(posts, *post)
	}

	return posts, nil
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
