package utils

import (
	"errors"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaim struct {
	UserID   uint   `json:"user_id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateAccessToken creates a short-lived access token (15 minutes)
func GenerateAccessToken(userID uint, email string, username string) (string, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", errors.New("JWT_SECRET not set in environment")
	}

	expiryMinutesStr := os.Getenv("ACCESS_TOKEN_EXPIRY_MINUTES")
	if expiryMinutesStr == "" {
		expiryMinutesStr = "15" // Default to 15 minutes
	}

	expiryMinutes, err := strconv.Atoi(expiryMinutesStr)
	if err != nil {
		return "", errors.New("invalid ACCESS_TOKEN_EXPIRY_MINUTES value")
	}

	expirationTime := time.Now().Add(time.Duration(expiryMinutes) * time.Minute)

	claims := &JWTClaim{
		UserID:   userID,
		Email:    email,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// GenerateRefreshToken creates a long-lived refresh token (7 days)
func GenerateRefreshToken(userID uint) (tokenString string, expiresAt time.Time, err error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", time.Time{}, errors.New("JWT_SECRET not set in environment")
	}

	expiryDaysStr := os.Getenv("REFRESH_TOKEN_EXPIRY_DAYS")
	if expiryDaysStr == "" {
		expiryDaysStr = "7" // Default to 7 days
	}

	expiryDays, err := strconv.Atoi(expiryDaysStr)
	if err != nil {
		return "", time.Time{}, errors.New("invalid REFRESH_TOKEN_EXPIRY_DAYS value")
	}

	expirationTime := time.Now().Add(time.Duration(expiryDays) * 24 * time.Hour)

	claims := &jwt.RegisteredClaims{
		Subject:   strconv.Itoa(int(userID)),
		ExpiresAt: jwt.NewNumericDate(expirationTime),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		NotBefore: jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expirationTime, nil
}

// ValidateJWT parses and validates an access token
func ValidateJWT(tokenString string) (*JWTClaim, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, errors.New("JWT_SECRET not set in environment")
	}

	claims := &JWTClaim{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// ValidateRefreshToken parses and validates a refresh token, returns userID
func ValidateRefreshToken(tokenString string) (uint, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return 0, errors.New("JWT_SECRET not set in environment")
	}

	claims := &jwt.RegisteredClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return 0, err
	}

	if !token.Valid {
		return 0, errors.New("invalid token")
	}

	// Extract user ID from Subject claim
	userID, err := strconv.ParseUint(claims.Subject, 10, 32)
	if err != nil {
		return 0, errors.New("invalid user ID in token")
	}

	return uint(userID), nil
}
