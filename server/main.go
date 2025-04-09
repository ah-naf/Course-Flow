package main

import (
	"course-flow/internal/middleware"
	"course-flow/internal/router"
	"course-flow/pkg/database"
	"fmt"
	"log"
	"net/http"
)

func main() {
	db, err := database.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	router := router.NewRouter(db)
	appRouter := middleware.CORSMiddleware([]string{"http://localhost:5173"})(router.Setup())

	// Start the server
	port := ":8080"
	fmt.Println("Server is running on port", port)
	log.Fatal(http.ListenAndServe(port, appRouter))
}
