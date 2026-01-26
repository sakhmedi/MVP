package handlers

import (
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"gin-quickstart/config"
	"gin-quickstart/models"

	"github.com/gin-gonic/gin"
)

// CreatePost handles post creation
func CreatePost(c *gin.Context) {
	var input struct {
		Title      string `json:"title" binding:"required"`
		Content    string `json:"content" binding:"required"`
		Excerpt    string `json:"excerpt"`
		CoverImage string `json:"cover_image"`
		Tags       string `json:"tags"`
		Published  bool   `json:"published"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Generate slug from title
	slug := generateSlug(input.Title)

	// Check if slug already exists
	var existingPost models.Post
	if err := config.DB.Where("slug = ?", slug).First(&existingPost).Error; err == nil {
		// Slug exists, append timestamp
		slug = slug + "-" + strconv.FormatInt(time.Now().Unix(), 10)
	}

	// Calculate read time (average reading speed: 200 words per minute)
	wordCount := len(strings.Fields(stripHTML(input.Content)))
	readTime := (wordCount + 199) / 200 // Round up

	post := models.Post{
		Title:      input.Title,
		Slug:       slug,
		Content:    input.Content,
		Excerpt:    input.Excerpt,
		CoverImage: input.CoverImage,
		AuthorID:   userID.(uint),
		Tags:       input.Tags,
		Published:  input.Published,
		ReadTime:   readTime,
	}

	if input.Published {
		now := time.Now()
		post.PublishedAt = &now
	}

	if err := config.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	// Load author information
	config.DB.Preload("Author").First(&post, post.ID)

	c.JSON(http.StatusCreated, gin.H{"post": post})
}

// UpdatePost handles post updates
func UpdatePost(c *gin.Context) {
	postID := c.Param("id")

	var post models.Post
	if err := config.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Check if user is the author
	if post.AuthorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own posts"})
		return
	}

	var input struct {
		Title      *string `json:"title"`
		Content    *string `json:"content"`
		Excerpt    *string `json:"excerpt"`
		CoverImage *string `json:"cover_image"`
		Tags       *string `json:"tags"`
		Published  *bool   `json:"published"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields if provided
	if input.Title != nil {
		post.Title = *input.Title
		// Regenerate slug if title changed
		slug := generateSlug(*input.Title)
		var existingPost models.Post
		if err := config.DB.Where("slug = ? AND id != ?", slug, post.ID).First(&existingPost).Error; err == nil {
			slug = slug + "-" + strconv.FormatInt(time.Now().Unix(), 10)
		}
		post.Slug = slug
	}

	if input.Content != nil {
		post.Content = *input.Content
		// Recalculate read time
		wordCount := len(strings.Fields(stripHTML(*input.Content)))
		post.ReadTime = (wordCount + 199) / 200
	}

	if input.Excerpt != nil {
		post.Excerpt = *input.Excerpt
	}

	if input.CoverImage != nil {
		post.CoverImage = *input.CoverImage
	}

	if input.Tags != nil {
		post.Tags = *input.Tags
	}

	if input.Published != nil {
		wasUnpublished := !post.Published
		post.Published = *input.Published

		// Set published_at if publishing for the first time
		if wasUnpublished && *input.Published {
			now := time.Now()
			post.PublishedAt = &now
		}
	}

	if err := config.DB.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	// Load author information
	config.DB.Preload("Author").First(&post, post.ID)

	c.JSON(http.StatusOK, gin.H{"post": post})
}

// DeletePost handles post deletion
func DeletePost(c *gin.Context) {
	postID := c.Param("id")

	var post models.Post
	if err := config.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Check if user is the author
	if post.AuthorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own posts"})
		return
	}

	if err := config.DB.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

// GetPost retrieves a single post by slug
func GetPost(c *gin.Context) {
	slug := c.Param("slug")

	var post models.Post
	if err := config.DB.Preload("Author").Where("slug = ?", slug).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Increment view count
	config.DB.Model(&post).Update("view_count", post.ViewCount+1)
	post.ViewCount++

	c.JSON(http.StatusOK, gin.H{"post": post})
}

// GetPosts retrieves all published posts with pagination
func GetPosts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	sort := c.DefaultQuery("sort", "latest")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	var posts []models.Post
	var total int64

	// Get only published posts
	query := config.DB.Where("published = ?", true).Preload("Author")

	query.Model(&models.Post{}).Count(&total)

	// Sort by views (trending) or by date (latest)
	var orderBy string
	if sort == "views" {
		orderBy = "view_count DESC"
	} else {
		orderBy = "published_at DESC"
	}

	if err := query.Order(orderBy).Limit(limit).Offset(offset).Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GetStaffPicks returns top 3 most viewed posts for sidebar
func GetStaffPicks(c *gin.Context) {
	var posts []models.Post

	if err := config.DB.Where("published = ?", true).
		Preload("Author").
		Order("view_count DESC").
		Limit(3).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch staff picks"})
		return
	}

	// Return simplified post data
	type StaffPick struct {
		ID          uint   `json:"id"`
		Title       string `json:"title"`
		Slug        string `json:"slug"`
		AuthorName  string `json:"author_name"`
		AuthorUsername string `json:"author_username"`
		PublishedAt string `json:"published_at"`
	}

	var picks []StaffPick
	for _, p := range posts {
		authorName := p.Author.FullName
		if authorName == "" {
			authorName = p.Author.Username
		}
		publishedAt := ""
		if p.PublishedAt != nil {
			publishedAt = p.PublishedAt.Format("Jan 2")
		}
		picks = append(picks, StaffPick{
			ID:          p.ID,
			Title:       p.Title,
			Slug:        p.Slug,
			AuthorName:  authorName,
			AuthorUsername: p.Author.Username,
			PublishedAt: publishedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"picks": picks})
}

// GetMyPosts retrieves all posts by the authenticated user
func GetMyPosts(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var posts []models.Post
	if err := config.DB.Where("author_id = ?", userID.(uint)).Preload("Author").Order("created_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// Helper function to generate URL-friendly slug from title
func generateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)

	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove special characters except hyphens
	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")

	// Remove consecutive hyphens
	reg = regexp.MustCompile("-+")
	slug = reg.ReplaceAllString(slug, "-")

	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")

	// Limit length
	if len(slug) > 100 {
		slug = slug[:100]
	}

	return slug
}

// Helper function to strip HTML tags for word count
func stripHTML(html string) string {
	reg := regexp.MustCompile("<[^>]*>")
	return reg.ReplaceAllString(html, " ")
}
