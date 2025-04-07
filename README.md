# Course Flow

**Course Flow** is a modern classroom management system inspired by Google Classroom. It is built with a **React** frontend (leveraging shadcn UI, React Query, and Zustand) and a **Go** backend (using Gorilla Mux for routing and Gorilla WebSocket for real-time communication). 

---

## Table of Contents

- [Course Flow](#course-flow)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Configuration](#environment-configuration)
    - [Running the Application](#running-the-application)
  - [API Overview](#api-overview)
  - [File Uploads \& Media](#file-uploads--media)
  - [WebSocket \& Real-Time Communication](#websocket--real-time-communication)
  - [Contributing](#contributing)
  - [Contact](#contact)

---

## Features

1. **User Authentication & OAuth**  
   - Login, registration, and logout using email and password.  
   - OAuth integrations with Google and GitHub.  
   - JWT-based session management for secure API and WebSocket access.

2. **Course (Class) Management**  
   - Create, delete, archive, and restore courses.  
   - Public or private courses, each with configurable permissions.  
   - Join courses using invite links or join codes.

3. **Posting & Commenting**  
   - Create, edit, and delete posts.  
   - Upload files (stored in the backend) with Markdown support.  
   - Add, edit, and delete comments on posts.

4. **Notifications**  
   - Real-time notifications for post creation, comments, messages, and role changes.  
   - Mark notifications as read or clear them.

5. **Real-Time Chat**  
   - WebSocket-based class-specific chat.  
   - Authentication ensures only enrolled members can access a course’s chat.

6. **Profile Management**  
   - Update user details (e.g., avatar, personal info).

7. **State Management**  
   - **React Query** for server-state caching and synchronization.  
   - **Zustand** for local state (e.g., UI states, ephemeral data).

---

## Technologies Used

- **Frontend:**
  - **React** with **shadcn UI** components
  - **React Query** for data fetching and caching
  - **Zustand** for local state management
  - **Axios** (or Fetch) for API calls

- **Backend:**
  - **Go**  
  - **Gorilla Mux** for routing  
  - **Gorilla WebSocket** for real-time communication  
  - **PostgreSQL** as the primary database  
  - **JWT** for token-based authentication  

- **File Storage:**
  - Uploaded files are stored on the backend filesystem in the `./media` directory.

---

## Project Structure

Below is a simplified view of the **backend** folder structure. (The frontend is not shown here because there is no `.env` configuration on the frontend side, and its structure may vary depending on your setup.)

```
backend/
├── bin/                          # Compiled binaries (if any)
├── db.sql                        # SQL file for database schema and initial setup
├── internal/
│   ├── handlers/                 # HTTP handlers for various endpoints
│   │   ├── attachment_handler.go
│   │   ├── auth_handler.go
│   │   ├── chat_handler.go
│   │   ├── course_handler.go
│   │   ├── notification_handler.go
│   │   ├── post_handler.go
│   │   └── user_handler.go
│   ├── middleware/
│   │   ├── error_mapping.go
│   │   └── middleware.go         # Auth and other middleware
│   ├── notifications/            # Notification logic (real-time and otherwise)
│   │   ├── comment_added.go
│   │   ├── message_sent.go
│   │   ├── post_created.go
│   │   └── role_changed.go
│   ├── router/
│   │   ├── attachment_routes.go
│   │   ├── auth_routes.go
│   │   ├── chat_routes.go
│   │   ├── course_member_routes.go
│   │   ├── course_routes.go
│   │   ├── notif_routes.go
│   │   ├── post_routes.go
│   │   └── user_routes.go
│   ├── services/                 # Core business logic for each feature
│   │   ├── attachment_service.go
│   │   ├── auth_service.go
│   │   ├── chat_service.go
│   │   ├── course_service.go
│   │   ├── member_service.go
│   │   ├── notification_service.go
│   │   └── post_service.go
│   ├── storage/                  # Database interactions (CRUD)
│   │   ├── attachment_storage.go
│   │   ├── auth_storage.go
│   │   ├── chat_storage.go
│   │   ├── course_member_storage.go
│   │   ├── course_storage.go
│   │   ├── document_storage.go
│   │   ├── notification_storage.go
│   │   ├── post_storage.go
│   │   └── user_storage.go
│   ├── utils/
│   │   └── utils.go              # Utility functions
│   └── websocket/
│       ├── hub.go
│       └── ...
├── pkg/
│   └── database/
│       └── db.go                 # Database connection setup
├── .env                          # Environment variables (see below)
├── .gitignore
└── main.go                       # Application entry point
```

---

## Getting Started

### Prerequisites

- **Go** (v1.16+)
- **PostgreSQL** (or a compatible Postgres service)
- **Node.js** (if you are running a separate React frontend)
- **Git** for version control

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/ah-naf/course-flow.git
   cd course-flow
   ```

2. **Backend Dependencies:**

   ```bash
   cd server
   go mod tidy
   ```

3. **(Optional) Frontend Dependencies:**

   If you have a separate frontend folder (not shown in the snippet), navigate there and install dependencies (e.g., `npm install` or `yarn install`).

### Environment Configuration

In the **backend** folder, you should have a `.env` file with the following variables (example values shown below):

```
DATABASE_URL=user=ahnaf dbname=collab_editor password=your_pass sslmode=disable
SECRET_KEY=
MEDIA_DIR=./media
GOOGLE_REDIRECT_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_REDIRECT_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OAUTH_COOKIE_FALLBACK=
BASE_URL=http://localhost:8080/
```

> **Note:**  
> - `DATABASE_URL` should match your PostgreSQL connection string.  
> - `SECRET_KEY` is used for JWT signing.  
> - `MEDIA_DIR` is the local directory for storing uploaded files.  
> - OAuth credentials (`GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, etc.) should match your registered apps.  
> - `BASE_URL` might be used for constructing callback URLs or for other service integrations.


### Running the Application

1. **Start the Backend:**

   ```bash
   cd server
   go run main.go
   ```

   The server should start on the port specified in your code (e.g., `8080` or whatever is configured).

2. **Frontend (if applicable):**

   If you have a separate React frontend:
   ```bash
   cd ../client
   npm run dev
   ```
   By default, the frontend might run on [http://localhost:5173](http://localhost:5173), but this can vary.

---

## API Overview

The backend exposes a RESTful API under routes such as `/api/v1`. Below are key endpoint groups:

- **Auth Routes** (`/auth`)  
  - `POST /register` – Register a new user.  
  - `POST /login` – Login and obtain JWT tokens.  
  - `POST /refresh` – Refresh expired tokens.  
  - `POST /logout` – Logout user, invalidating tokens.  
  - `GET /google/login`, `GET /google/callback` – Google OAuth flow.  
  - `GET /github/login`, `GET /github/callback` – GitHub OAuth flow.

- **User Routes** (`/users`)  
  - `GET /` – Get user details (admin or self usage).  
  - `GET /me` – Get current user info.  
  - `PUT /edit` – Update user details (avatar, name, etc.).

- **Course (Class) Routes** (`/courses`)  
  - `POST /` – Create a course.  
  - `GET /` – Get courses for the authenticated user.  
  - `PUT /archive` – Archive a course.  
  - `PUT /restore` – Restore an archived course.  
  - `DELETE /{id}` – Delete a course.  
  - `POST /join` – Join a course by code or invite link.  
  - Additional endpoints for course preview, leaving a course, updating settings, etc.

- **Course Members** (`/members`)  
  - `GET /{id}` – Get all members in a course.  
  - `PUT /change-role/{id}` – Change a user’s role (teacher, student, etc.).

- **Posts & Comments** (`/posts`)  
  - `GET /{course_id}` – Fetch all posts for a course.  
  - `POST /{course_id}` – Create a new post.  
  - `PUT /{post_id}` – Edit a post.  
  - `DELETE /{post_id}` – Delete a post.  
  - `POST /comment/{post_id}` – Add a comment.  
  - `PUT /comment/{comment_id}` – Edit a comment.  
  - `DELETE /comment/{comment_id}` – Delete a comment.

- **Attachments** (`/attachments`)  
  - `GET /{id}` – Get all attachments for a specific course (or post).

- **Notifications** (`/notifications`)  
  - `GET /` – Retrieve all notifications for a user.  
  - `POST /read` – Mark a notification as read.  
  - `POST /read-all` – Mark all notifications as read.  
  - `POST /clear` – Clear all notifications.

- **Chat** (`/chat`)  
  - `GET /{course_id}` – Retrieve chat messages for a specific course.

---

## File Uploads & Media

- **Upload Handling:**  
  - Files attached to posts are uploaded to the backend and stored in the directory specified by `MEDIA_DIR` (e.g., `./media`).
- **Serving Files:**  
  - The backend exposes these files under the `/media/` path. A `FileServer` or similar approach strips the prefix and serves files from the `MEDIA_DIR`.

---

## WebSocket & Real-Time Communication

- **Gorilla WebSocket:**  
  - A central `Hub` manages all active connections.
  - Each user connects via `/api/v1/ws` with a valid JWT token (provided in query params).  
- **Use Cases:**  
  - **Chat:** Class-specific real-time messaging.  
  - **Notifications:** Broadcast new post/comment notifications or role changes to the relevant users.

---

## Contributing

1. **Fork** the repository.  
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "Add a new feature"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/your-feature
   ```
5. **Open a Pull Request** for review.

---


## Contact

- **Project Maintainer:** [Ahnaf Hasan Shifat](mailto:sheikhahnafshifatl@gmail.com)  
- **GitHub:** [github.com/ah-naf](https://github.com/ah-naf)

For any inquiries, issues, or suggestions, please reach out via GitHub or email.
