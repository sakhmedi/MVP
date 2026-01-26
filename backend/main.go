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
	err := config.DB.AutoMigrate(&models.User{}, &models.Post{}, &models.RefreshToken{}, &models.BlacklistedToken{}, &models.Like{}, &models.Follow{}, &models.Bookmark{})
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
		api.GET("/posts/staff-picks", handlers.GetStaffPicks)
		api.GET("/posts/:slug", handlers.GetPost)

		// Public user routes
		api.GET("/users/:username", handlers.GetUserProfile)
		api.GET("/users/:username/posts", handlers.GetUserPosts)

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

			// Bookmark routes
			protected.POST("/bookmarks/:postId", handlers.AddBookmark)
			protected.DELETE("/bookmarks/:postId", handlers.RemoveBookmark)
			protected.GET("/bookmarks", handlers.GetBookmarks)
			protected.GET("/bookmarks/check/:postId", handlers.CheckBookmark)

			// Follow routes
			protected.POST("/users/:username/follow", handlers.FollowUser)
			protected.DELETE("/users/:username/follow", handlers.UnfollowUser)
			protected.GET("/users/:username/following-check", handlers.CheckFollowing)
			protected.GET("/feed/following", handlers.GetFollowingFeed)
			protected.GET("/users/suggestions", handlers.GetSuggestedUsers)
		}
	}

	// Start server
	log.Println("Server starting on :8080")
	router.Run(":8080")
}
