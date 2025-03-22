package models

type Post struct {
	ID        string `json:"id"`
	CourseID  string `json:"course_id"`
	UserID    string `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type PostResponse struct {
	Post
	User User `json:"user"`
}
