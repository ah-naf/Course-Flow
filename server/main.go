package main

import (
	"collab-editor/pkg/database"
	"fmt"
	"log"
)

func main() {
	db, err := database.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%+v", db)
}
