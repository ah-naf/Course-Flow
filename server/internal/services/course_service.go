package services

import (
	"course-flow/internal/storage"
	"course-flow/internal/types"
	"course-flow/internal/utils"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
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
	CourseStorage   *storage.CourseStorage
	DocumentService *DocumentService
}

func NewCourseService(courseStorage *storage.CourseStorage, documentStorage *storage.DocumentStorage) *CourseService {
	documentService := NewDocumentService(documentStorage)
	return &CourseService{
		CourseStorage:   courseStorage,
		DocumentService: documentService,
	}
}

func (s *CourseService) UpdateCourseSetting(course *types.CoursePreviewResponse, r *http.Request) error {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Course ID is required",
		}
	}
	course.ID = id

	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "File too large"}
	}

	// Get all uploaded files from the "document" form field
	files := r.MultipartForm.File["cover_pic"]

	uploadedDoc, err := s.DocumentService.SaveFilesToLocal(files, userID)
	if err != nil {
		return err
	}

	if len(uploadedDoc) > 0 {
		course.CoverPic = uploadedDoc[0].FilePath
	}

	course.UpdatedAt = time.Now()

	return s.CourseStorage.UpdateCourseSetting(userID, course)
}

func (s *CourseService) CoursePreview(r *http.Request) (*types.CoursePreviewResponse, error) {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	showRole := false
	if err == nil && userID != "" {
		showRole = true
	}

	vars := mux.Vars(r)
	joinCode := vars["id"]
	if joinCode == "" {
		return nil, &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Join code is required",
		}
	}

	return s.CourseStorage.CoursePreview(joinCode, userID, showRole)
}

func (s *CourseService) LeaveCourse(toKick string, r *http.Request) (string, string, error) {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return "", "", err
	}

	if toKick != "" {
		userID = toKick
	}

	vars := mux.Vars(r)
	courseID := vars["id"]
	if courseID == "" {
		return "", "", &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "course_id is required",
		}
	}

	return userID, courseID, s.CourseStorage.LeaveCourse(courseID, userID)
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

func (s *CourseService) GetCourseOfSingleUser(r *http.Request) ([]*types.CourseListResponse, error) {
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

	return s.CourseStorage.GetCourseByUserID(userID, archived)
}

func (s *CourseService) JoinCourseService(joinCode string, r *http.Request) error {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	if strings.TrimSpace(joinCode) == "" {
		return &utils.ApiError{
			Code:    http.StatusNotFound,
			Message: "Course ID is required.",
		}
	}

	return s.CourseStorage.JoinCourse(joinCode, userID)
}

// GetCoursesByInstructor fetches all courses where the given user is the instructor.
func (s *CourseService) GetCoursesByInstructor(r *http.Request) ([]*types.CourseListResponse, error) {
	ctx := r.Context()
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	return s.CourseStorage.GetCoursesByInstructor(userID)
}

func (s *CourseService) CreateNewCourseService(course *types.Course, r *http.Request) error {
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
	course.PostPermission = 3 // 3 for 'Instructor'

	if course.BackgroundColor == "" {
		// Create a new random instance instead of seeding the global source
		randGen := rand.New(rand.NewSource(time.Now().UnixNano()))
		course.BackgroundColor = backgroundColors[randGen.Intn(len(backgroundColors))]
	}

	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "File too large"}
	}

	// Get all uploaded files from the "document" form field
	files := r.MultipartForm.File["cover_pic"]

	uploadedDoc, err := s.DocumentService.SaveFilesToLocal(files, instructorID)
	if err != nil {
		return err
	}

	if len(uploadedDoc) > 0 {
		course.CoverPic = uploadedDoc[0].FilePath
	}

	now := time.Now()
	course.CreatedAt = now
	course.UpdatedAt = now

	err = s.CourseStorage.CreateNewCourse(course)
	if err != nil {
		return err
	}

	return nil
}
