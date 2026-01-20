package models

import (
	"time"

	"gorm.io/gorm"
)

type BlacklistedToken struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Token     string         `gorm:"unique;not null;index" json:"token"`
	ExpiresAt time.Time      `gorm:"not null;index" json:"expires_at"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
