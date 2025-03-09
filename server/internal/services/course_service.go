package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"collab-editor/internal/utils"
	"math/rand"
	"net/http"
	"time"

	"github.com/go-playground/validator"
)

var backgroundColors = []string{
	"#2E7D32", // Dark Green
	"#D81B60", // Deep Pink
	"#1976D2", // Dark Blue
	"#6A1B9A", // Deep Purple
	"#C62828", // Dark Red
	"#F57C00", // Deep Orange
	"#455A64", // Blue Grey
}

type CourseService struct {
	CourseStorage *storage.CourseStorage
}

func NewCourseService(courseStorage *storage.CourseStorage) *CourseService {
	return &CourseService{CourseStorage: courseStorage}
}

func (s *CourseService) CreateNewCourseService(course *models.Course, r *http.Request) error {
	ctx := r.Context()
	instructorID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}
	course.InstructorID = instructorID

	validate := validator.New()
	if err := validate.Struct(course); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, err := range validationErrors {
				return &utils.ApiError{
					Code:    http.StatusBadRequest,
					Message: getValidationMessage(err),
				}
			}
		}
		return &utils.ApiError{
			Code:    http.StatusInternalServerError,
			Message: "Validation error: " + err.Error(),
		}
	}

	// Set default values
	course.IsPrivate = false
	course.IsArchived = false
	course.PostPermission = "Instructor"
	now := time.Now()
	course.CreatedAt = now
	course.UpdatedAt = now

	if course.BackgroundColor == "" {
		// Create a new random instance instead of seeding the global source
		randGen := rand.New(rand.NewSource(time.Now().UnixNano()))
		course.BackgroundColor = backgroundColors[randGen.Intn(len(backgroundColors))]
	}

	err = s.CourseStorage.CreateNewCourse(course)
	if err != nil {
		// Check if it's a duplicate join_code error (PostgreSQL-specific)
		if err.Error() == "pq: duplicate key value violates unique constraint \"unique_join_code\"" {
			return &utils.ApiError{
				Code:    http.StatusConflict,
				Message: "Class ID must be unique",
			}
		}
		return &utils.ApiError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create course: " + err.Error(),
		}
	}

	return nil
}
