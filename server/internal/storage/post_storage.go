package storage

import (
	"course-flow/internal/types"
	"course-flow/internal/utils"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

type PostStorage struct {
	DB *sql.DB
}

func NewPostStorage(db *sql.DB) *PostStorage {
	return &PostStorage{DB: db}
}

func (s *PostStorage) GetAllCommentedUserForPost(postID, commentID string) (*types.User, []string, error) {
	query := `
		SELECT DISTINCT user_id FROM comments WHERE post_id = $1
	`

	var userIDs []string
	rows, err := s.DB.Query(query, postID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to query user for comments: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var userID string
		// Optionally check for null userID if necessary
		err = rows.Scan(&userID)
		if err != nil {
			return nil, nil, fmt.Errorf("error scanning user id from comment: %v", err)
		}
		userIDs = append(userIDs, userID)
	}

	if err = rows.Err(); err != nil {
		return nil, nil, fmt.Errorf("error iterating over comment rows: %v", err)
	}

	whoCommentedQuery := `
		SELECT u.id, u.avatar, u.first_name, u.last_name, u.username, u.email
		FROM comments c
		JOIN users u
		ON u.id = c.user_id
		WHERE c.id = $1
	`

	var whoCommented types.User
	err = s.DB.QueryRow(whoCommentedQuery, commentID).Scan(
		&whoCommented.ID,
		&whoCommented.Avatar,
		&whoCommented.FirstName,
		&whoCommented.LastName,
		&whoCommented.Username,
		&whoCommented.Email,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("error scanning comment created user: %v", err)
	}
	whoCommented.Avatar = utils.NormalizeMedia(whoCommented.Avatar)

	whoPostedQuery := "SELECT user_id FROM posts WHERE id = $1"
	var whoPostedID string
	err = s.DB.QueryRow(whoPostedQuery, postID).Scan(&whoPostedID)
	if err != nil {
		return nil, nil, fmt.Errorf("error scanning post created user: %v", err)
	}

	userIDs = append(userIDs, whoPostedID)

	return &whoCommented, userIDs, nil
}

func (s *PostStorage) GetAllCommentsForPost(postID string) ([]types.Comment, error) {
	query := `
		SELECT 
			c.id AS comment_id,
			c.post_id,
			c.user_id,
			c.content,
			c.created_at,
			u.id AS user_id,
			u.email,
			u.username,
			u.first_name,
			u.last_name,
			u.avatar
		FROM comments c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.post_id = $1
		ORDER BY c.created_at ASC
	`

	rows, err := s.DB.Query(query, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to query comments for post %s: %v", postID, err)
	}
	defer rows.Close()

	var comments []types.Comment
	commentMap := make(map[string]*types.Comment)

	for rows.Next() {
		var (
			commentID, postID, userID   string
			content                     string
			createdAt                   time.Time
			uID, email, username        sql.NullString
			firstName, lastName, avatar sql.NullString
		)

		err := rows.Scan(
			&commentID, &postID, &userID, &content, &createdAt,
			&uID, &email, &username, &firstName, &lastName, &avatar,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		// Create or update the comment in the map
		comment, exists := commentMap[commentID]
		if !exists {
			var user *types.User
			if uID.Valid { // Only create a User struct if the user exists
				user = &types.User{
					ID:        uID.String,
					Email:     email.String,
					Username:  username.String,
					FirstName: firstName.String,
					LastName:  lastName.String,
					Avatar:    avatar.String,
				}
				user.Avatar = utils.NormalizeMedia(user.Avatar)
			}

			comment = &types.Comment{
				ID:        commentID,
				PostID:    postID,
				UserID:    userID,
				Content:   content,
				CreatedAt: createdAt,
				User:      user,
			}
			commentMap[commentID] = comment
			comments = append(comments, *comment)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %v", err)
	}

	return comments, nil
}

func (s *PostStorage) DeleteComment(commentID, userID, postID string) error {
	tx, err := s.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	adminQuery := `
		SELECT c.admin_id 
		FROM courses c
		JOIN posts p
		ON c.id = p.course_id
		WHERE p.id = $1
	`

	var adminID string
	err = tx.QueryRow(adminQuery, postID).Scan(&adminID)
	if err == sql.ErrNoRows {
		return &utils.ApiError{Code: http.StatusNotFound, Message: "Post not found"}
	}
	if err != nil {
		return fmt.Errorf("failed to fetch course admin: %v", err)
	}

	if adminID != userID {
		var whoCommented string
		err := tx.QueryRow("SELECT user_id FROM comments WHERE id = $1", commentID).Scan(&whoCommented)
		if err == sql.ErrNoRows {
			return &utils.ApiError{Code: http.StatusNotFound, Message: "Comment not found"}
		}
		if err != nil {
			return fmt.Errorf("Error scanning user id from comment: %v", err)
		}

		if whoCommented != userID {
			return &utils.ApiError{Code: http.StatusUnauthorized, Message: "You are not authorized to delete this comment"}
		}
	}

	query := `
		DELETE FROM comments
		WHERE id = $1
	`

	result, err := tx.Exec(query, commentID)
	if err != nil {
		return fmt.Errorf("failed to delete comment: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return &utils.ApiError{Code: http.StatusUnauthorized, Message: "Comment not found or you are not authorized"}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	log.Printf("Successfully deleted comment with id %v by user %v\n", commentID, userID)
	return nil
}

func (s *PostStorage) EditComment(commentID, comment, userID string) error {
	if strings.TrimSpace(comment) == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Comment cannot be empty",
		}
	}

	tx, err := s.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	query := `
		UPDATE comments
		SET content = $1
		WHERE user_id = $2 AND id = $3
	`

	result, err := tx.Exec(query, comment, userID, commentID)
	if err != nil {
		return fmt.Errorf("failed to edit comment: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return &utils.ApiError{Code: http.StatusNotFound, Message: "Comment not found"}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	log.Printf("Successfully edited comment with id %v by user %v\n", commentID, userID)
	return nil
}

func (s *PostStorage) AddComment(postID, comment, userID string) (*types.NotifCommentCreatedResponse, error) {
	if strings.TrimSpace(comment) == "" {
		return nil, &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Comment cannot be empty",
		}
	}

	tx, err := s.DB.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO comments (post_id, user_id, content, created_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	var commentID string
	err = tx.QueryRow(query, postID, userID, comment, time.Now().UTC()).Scan(&commentID)
	if err != nil {
		if err.Error() == "pq: insert or update on table \"comments\" violates foreign key constraint \"comments_post_id_fkey\"" {
			return nil, &utils.ApiError{Code: http.StatusNotFound, Message: fmt.Sprintf("Post not found with id %s", postID)}
		}
		if err.Error() == "pq: insert or update on table \"comments\" violates foreign key constraint \"comments_user_id_fkey\"" {
			return nil, &utils.ApiError{Code: http.StatusNotFound, Message: fmt.Sprintf("User not found with id %s", userID)}
		}
		return nil, fmt.Errorf("failed to insert comment: %v", err)
	}

	var classID string
	err = tx.QueryRow("SELECT course_id FROM posts WHERE id = $1", postID).Scan(&classID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve class id for post: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	log.Printf("Successfully added comment with id %s to post %s by user %s", commentID, postID, userID)
	return &types.NotifCommentCreatedResponse{
		UserID:    userID,
		PostID:    postID,
		ClassID:   classID,
		CommentID: commentID,
		Data:      map[string]interface{}{"postID": postID, "commentID": commentID, "content": comment},
	}, nil
}

func (s *PostStorage) EditPost(postID, userID, content string) error {
	// Input validation
	if strings.TrimSpace(content) == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Content cannot be empty",
		}
	}

	// Begin a transaction
	tx, err := s.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	query := `
		UPDATE posts
		SET content = $1, updated_at = $2
		WHERE id = $3 AND user_id = $4
	`
	now := time.Now().UTC() // Use UTC for consistency
	result, err := tx.Exec(query, content, now, postID, userID)
	if err != nil {
		return fmt.Errorf("failed to update post: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		// Check if the post exists to provide a more specific error
		var exists bool
		err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1)", postID).Scan(&exists)
		if err != nil {
			return fmt.Errorf("failed to check if post exists: %v", err)
		}
		if !exists {
			return &utils.ApiError{
				Code:    http.StatusNotFound,
				Message: "Post not found",
			}
		}
		return &utils.ApiError{
			Code:    http.StatusUnauthorized,
			Message: "You are not authorized to edit this post",
		}
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	log.Printf("Successfully updated post with id %s by user %s", postID, userID)
	return nil
}

func (s *PostStorage) GetAllPost(courseID string) ([]types.PostResponse, error) {
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
		return nil, fmt.Errorf("failed to query posts for course %s: %v", courseID, err)
	}
	defer rows.Close()

	// Use a map to aggregate attachments with their respective posts.
	postsMap := make(map[string]*types.PostResponse)

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
			return nil, fmt.Errorf("failed to scan row for post with id %s: %v", pID, err)
		}

		// If the post hasn't been added to the map yet, add it along with the user details.
		post, exists := postsMap[pID]
		if !exists {
			post = &types.PostResponse{
				Post: types.Post{
					ID:        pID,
					UserID:    pUserID,
					Content:   pContent,
					CreatedAt: pCreatedAt,
					UpdatedAt: pUpdatedAt,
				},
				User: types.User{
					Username:  uUsername.String,
					FirstName: uFirstName.String,
					LastName:  uLastName.String,
					Avatar:    utils.NormalizeMedia(uAvatar.String),
				},
				// Initialize attachments slice.
				Attachment: []types.Attachment{},
			}
			postsMap[pID] = post
		}

		// If an attachment exists (its id is non-null), append it.
		if aID.Valid {
			attachment := types.Attachment{
				ID:         aID.String,
				UploadedBy: aUploadedBy.String,
			}
			if aUploadDate.Valid {
				attachment.UploadDate = aUploadDate.Time
			}
			// If document info exists, include it.
			if dID.Valid {
				attachment.Document = &types.Document{
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
		return nil, fmt.Errorf("error iterating over posts rows: %v", err)
	}

	// Convert the posts map into a slice.
	posts := make([]types.PostResponse, 0, len(postsMap))
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
		return fmt.Errorf("failed to query course with id %s: %v", courseID, err)
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
		return fmt.Errorf("failed to query post with id %s for course %s: %v", postID, courseID, err)
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
		return fmt.Errorf("failed to delete post with id %s for course %s: %v", postID, courseID, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected for deletion of post with id %s: %v", postID, err)
	}

	if rowsAffected == 0 {
		return &utils.ApiError{
			Code:    http.StatusNotFound,
			Message: "Post not found",
		}
	}

	log.Printf("Successfully deleted post with id %s for course %s by user %s", postID, courseID, userID)
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
		return "", fmt.Errorf("failed to query course with id %s: %v", courseID, err)
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
			return "", fmt.Errorf("failed to query role for user %s in course %s: %v", userID, courseID, err)
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
		return "", fmt.Errorf("failed to create post in course %s for user %s: %v", courseID, userID, err)
	}

	if postID == "" {
		return "", &utils.ApiError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create post",
		}
	}

	log.Printf("Successfully created post with id %s in course %s by user %s", postID, courseID, userID)
	return postID, nil
}
