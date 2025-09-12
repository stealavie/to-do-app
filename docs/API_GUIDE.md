# API Guide

## Overview

The Collaborative Learning Platform API provides a comprehensive set of REST endpoints for managing users, learning groups, projects, and real-time notifications. All endpoints return JSON responses and follow RESTful conventions.

## Base Configuration

### Base URL
```
Development: http://localhost:3000
Production: [Your production URL]
```

### Content Type
```
Content-Type: application/json
```

### Authentication
Protected endpoints require JWT token authentication:
```
Authorization: Bearer <your_jwt_token>
```

## Quick Start

1. **Register a user**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Create a group**: `POST /api/groups`
4. **Invite members**: `POST /api/groups/:id/invite` or share invite code
5. **Create projects**: `POST /api/groups/:groupId/projects`
6. **Manage tasks**: `PUT /api/projects/:id`

## API Endpoints

This API is organized into the following sections. Please refer to the individual files for detailed endpoint documentation.

- [Authentication Endpoints](./API_GUIDE_AUTH.md)
- [Learning Groups Management](./API_GUIDE_GROUPS.md)
- [Project Management](./API_GUIDE_PROJECTS.md)
- [Notifications](./API_GUIDE_NOTIFICATIONS.md)
- [Real-time Communication (Socket.IO)](./API_GUIDE_SOCKETS.md)
- [Gemini AI Assistant](./API_GUIDE_AI.md)
