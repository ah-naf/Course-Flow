package main

import (
	"collab-editor/internal/server"
	"collab-editor/pkg/database"
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

	router := server.SetupRouter(db)

	// Start the server
	port := ":8080"
	fmt.Println("Server is running on port", port)
	log.Fatal(http.ListenAndServe(port, router))
}
