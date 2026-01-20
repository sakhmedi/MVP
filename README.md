# Blog Platform

A full-stack blogging platform where users can read, write, and share stories and ideas.

## Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **TipTap** - Rich text editor
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Go** (Golang)
- **Gin** - Web framework
- **GORM** - ORM for database operations
- **PostgreSQL** - Database
- **JWT** - Authentication with refresh tokens

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete blog posts
- Rich text editor with formatting options
- Public and protected routes

## Project Structure

```
├── frontend/          # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # React context (auth)
│       ├── pages/        # Page components
│       └── services/     # API services
└── backend/           # Go backend
    ├── config/        # Database configuration
    ├── handlers/      # Route handlers
    ├── middleware/    # Auth middleware
    ├── models/        # Database models
    └── utils/         # JWT and validation utilities
```

## Getting Started

### Prerequisites
- Node.js
- Go 1.25+
- PostgreSQL

### Backend
```bash
cd backend
go mod download
go run main.go
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend API on `http://localhost:8080`.
