package services

import (
	"course-flow/internal/models"
	"course-flow/internal/storage"
	"course-flow/internal/utils"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/go-playground/validator"
	"github.com/gorilla/mux"
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

func (s *CourseService) DeleteCourse(r *http.Request) error {
	ctx := r.Context()
	AdminID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	vars := mux.Vars(r)
	courseID := vars["id"]
	if courseID == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "course_id is required",
		}
	}

	return s.CourseStorage.DeleteCourse(courseID, AdminID)
}

func (s *CourseService) RestoreArchivedCourse(courseID string, r *http.Request) error {
	ctx := r.Context()
	AdminID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	return s.CourseStorage.ArchiveCourse(courseID, AdminID, false)
}

func (s *CourseService) ArchiveCourse(courseID string, r *http.Request) error {
	ctx := r.Context()
	AdminID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	return s.CourseStorage.ArchiveCourse(courseID, AdminID, true)
}

func (s *CourseService) GetCourseOfSingleUser(r *http.Request) ([]*models.CourseListResponse, error) {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	archivedStr := r.URL.Query().Get("archived")
	archived := false
	if archivedStr != "" {
		var err error
		archived, err = strconv.ParseBool(archivedStr)
		if err != nil {
			return nil, &utils.ApiError{
				Code:    http.StatusBadRequest,
				Message: "invalid archived parameter, must be true or false",
			}
		}
	}
	fmt.Println("archive", archived)

	return s.CourseStorage.GetCourseByUserID(userID, archived)
}

func (s *CourseService) JoinCourseService(joinCode string, r *http.Request) error {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	return s.CourseStorage.JoinCourse(joinCode, userID)
}

// GetCoursesByInstructor fetches all courses where the given user is the instructor.
func (s *CourseService) GetCoursesByInstructor(r *http.Request) ([]*models.CourseListResponse, error) {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	return s.CourseStorage.GetCoursesByInstructor(userID)
}

func (s *CourseService) CreateNewCourseService(course *models.Course, r *http.Request) error {
	ctx := r.Context()
	instructorID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}
	course.AdminID = instructorID

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
		return err
	}

	return nil
}
