package main

import (
	"gin-quickstart/config"
	"gin-quickstart/handlers"
	"gin-quickstart/middleware"
	"gin-quickstart/models"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to database
	config.ConnectDatabase()

	// Auto-migrate database models
	err := config.DB.AutoMigrate(&models.User{}, &models.Post{}, &models.RefreshToken{}, &models.BlacklistedToken{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migration completed!")

	// Initialize Gin router
	router := gin.Default()

	// CORS middleware - allows frontend to connect
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health check routes
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Blog API v1.0",
		})
	})

	// API route group
	api := router.Group("/api")
	{
		// Public authentication routes (no middleware)
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/refresh", handlers.RefreshTokenHandler)
			auth.POST("/logout", handlers.Logout)
		}

		// Public post routes (read-only)
		api.GET("/posts", handlers.GetPosts)
		api.GET("/posts/:slug", handlers.GetPost)

		// Protected routes (require JWT authentication)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/user/me", handlers.GetCurrentUser)

			// Post management routes
			protected.POST("/posts", handlers.CreatePost)
			protected.PUT("/posts/:id", handlers.UpdatePost)
			protected.DELETE("/posts/:id", handlers.DeletePost)
			protected.GET("/posts/my", handlers.GetMyPosts)
		}
	}

	// Start server
	log.Println("Server starting on :8080")
	router.Run(":8080")
}
