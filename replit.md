# Video Platform Application

## Overview

This is a full-stack video management platform built with React, Express, and PostgreSQL. The application allows users to upload, organize, and stream video files through a hierarchical folder structure. It features a modern UI built with shadcn/ui components and Tailwind CSS, along with secure authentication and video streaming capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer for handling video file uploads
- **Authentication**: Simple secret key-based authentication

### Database Schema
- **folders**: Hierarchical folder structure with parent-child relationships
- **videos**: Video metadata with custom IDs, file information, and folder associations
- **users**: User authentication (referenced but not fully implemented)

## Key Components

### Frontend Components
- **Dashboard**: Main application interface with video grid and folder navigation
- **VideoCard**: Individual video display with play, copy link, and delete actions
- **VideoPlayer**: Full-screen video player with HTML5 video controls
- **UploadModal**: Video upload interface with metadata input
- **FolderModal**: Folder creation interface
- **Login**: Authentication interface

### Backend Services
- **Storage Layer**: Database abstraction layer for CRUD operations
- **File Management**: Multer configuration for video file handling
- **Authentication Middleware**: Session-based authentication protection
- **Video Streaming**: Direct file streaming via custom endpoints

### API Endpoints
- Authentication: `/api/login`, `/api/logout`, `/api/auth/status`
- Videos: `/api/videos` (CRUD operations), `/api/videos/upload`, `/api/stream/:customId`
- Folders: `/api/folders` (CRUD operations), `/api/folders/all`
- Statistics: `/api/stats`

## Data Flow

1. **Authentication**: Users authenticate using a secret key, creating a session
2. **File Upload**: Videos are uploaded via multipart form data, stored locally, and metadata saved to database
3. **Organization**: Videos can be organized into hierarchical folders
4. **Streaming**: Videos are streamed directly from the server using custom IDs
5. **Management**: Users can view, play, copy links, and delete videos through the dashboard

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **File Storage**: Local filesystem storage in `/uploads` directory
- **UI Framework**: Radix UI primitives for accessible components
- **Validation**: Zod for schema validation with Drizzle integration

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support with strict configuration
- **Development Server**: Hot reload with Vite dev server

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with `npm run dev`
- **Production**: Build process creates optimized client bundle and server bundle
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **File Storage**: Requires writable `uploads` directory

### Build Process
1. Client build: Vite builds React application to `dist/public`
2. Server build: esbuild bundles Express server to `dist/index.js`
3. Static serving: Production server serves client files and handles API routes

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Port Configuration**: Internal port 5000, external port 80
- **Auto-deployment**: Configured for Replit's autoscale deployment target

## Changelog

```
Changelog:
- June 25, 2025: Initial setup of StreamVault Pro
- June 25, 2025: Complete UI overhaul with Layout component and navigation
- June 25, 2025: Added Folders, Analytics, and Settings pages with full functionality
- June 25, 2025: Fixed upload modal and authentication issues
- June 25, 2025: Implemented hierarchical folder structure with breadcrumb navigation
- June 25, 2025: Added real-time upload progress bar with XMLHttpRequest tracking
- June 25, 2025: Fixed folder modal refresh - new folders appear instantly
- June 25, 2025: Implemented real system monitoring (uptime, CPU, RAM, disk usage)
- June 25, 2025: Created Videos section with detailed video management and statistics
- June 25, 2025: Enhanced Analytics with real-time bandwidth, active streams, system metrics
- June 25, 2025: Redesigned Videos page with modern responsive Netflix-inspired interface
- June 25, 2025: Enhanced streaming engine with concurrent stream tracking and monitoring
- June 25, 2025: Added Scalability dashboard for real-time performance monitoring
- June 25, 2025: Improved HTTP streaming with range requests and bandwidth optimization
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```