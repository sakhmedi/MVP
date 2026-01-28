package models

import (
	"time"

	"gorm.io/gorm"
)

type Post struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Slug        string         `gorm:"unique;not null;index" json:"slug"`
	Content     string         `gorm:"type:text;not null" json:"content"` // Markdown content
	Excerpt     string         `gorm:"type:text" json:"excerpt"`          // Short description
	CoverImage  string         `json:"cover_image"`
	AuthorID    uint           `gorm:"not null;index" json:"author_id"`
	Author      User           `gorm:"foreignKey:AuthorID" json:"author"`
	Tags        string         `json:"tags"`        // Comma-separated tags or JSON array
	Published   bool           `gorm:"default:false" json:"published"`
	ViewCount   int            `gorm:"default:0" json:"view_count"`
	ReadTime    int            `json:"read_time"` // Estimated read time in minutes
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	PublishedAt *time.Time     `json:"published_at"`
	ScheduledAt *time.Time     `json:"scheduled_at"`                       // For scheduled posts
	Unlisted    bool           `gorm:"default:false" json:"unlisted"`      // Hidden from feeds
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
