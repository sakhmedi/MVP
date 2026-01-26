package models

import (
	"time"

	"gorm.io/gorm"
)

type Like struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;index;uniqueIndex:idx_user_post" json:"user_id"`
	PostID    uint           `gorm:"not null;index;uniqueIndex:idx_user_post" json:"post_id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"-"`
	Post Post `gorm:"foreignKey:PostID" json:"-"`
}
