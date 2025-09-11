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

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "cm0x7y9za0000xyz123456789",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2025-09-10T07:38:46.876Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "cm0x7y9za0000xyz123456789",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2025-09-10T07:38:46.876Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Learning Groups Management

### Create Group
```http
POST /api/groups
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Study Group Name",
  "description": "Optional description"
}
```

**Response (201 Created):**
```json
{
  "message": "Group created successfully",
  "group": {
    "id": "cm0x7y9za0001xyz123456789",
    "name": "Study Group Name",
    "description": "Optional description",
    "inviteCode": "UNIQUE_INVITE_CODE",
    "createdAt": "2025-09-10T07:38:46.876Z",
    "memberships": [
      {
        "userId": "cm0x7y9za0000xyz123456789",
        "role": "OWNER",
        "user": {
          "id": "cm0x7y9za0000xyz123456789",
          "username": "username",
          "email": "user@example.com"
        }
      }
    ]
  }
}
```

### Get Group Details
```http
GET /api/groups/:id
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "group": {
    "id": "cm0x7y9za0001xyz123456789",
    "name": "Study Group Name",
    "description": "Optional description",
    "inviteCode": "UNIQUE_INVITE_CODE",
    "createdAt": "2025-09-10T07:38:46.876Z",
    "memberships": [...],
    "projects": [
      {
        "id": "cm0x7y9za0002xyz123456789",
        "title": "Project Title",
        "description": "Project description",
        "status": "PLANNING",
        "priority": "MEDIUM",
        "dueDate": "2025-09-20T10:00:00Z",
        "assignedUser": {
          "id": "cm0x7y9za0000xyz123456789",
          "username": "username"
        },
        "createdAt": "2025-09-10T07:38:46.876Z"
      }
    ]
  }
}
```

### Join Group via Invite Code
```http
POST /api/groups/join
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "inviteCode": "UNIQUE_INVITE_CODE"
}
```

**Response (201 Created):**
```json
{
  "message": "Successfully joined the group",
  "membership": {
    "userId": "cm0x7y9za0000xyz123456789",
    "groupId": "cm0x7y9za0001xyz123456789",
    "role": "MEMBER",
    "joinedAt": "2025-09-10T07:38:46.876Z",
    "group": {
      "id": "cm0x7y9za0001xyz123456789",
      "name": "Study Group Name"
    }
  }
}
```

### Invite User to Group
```http
POST /api/groups/:id/invite
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "username": "username_to_invite"
}
```

**Requirements**: OWNER or ADMIN role

**Response (201 Created):**
```json
{
  "message": "User invited successfully",
  "membership": {
    "userId": "cm0x7y9za0003xyz123456789",
    "groupId": "cm0x7y9za0001xyz123456789",
    "role": "MEMBER",
    "joinedAt": "2025-09-10T07:38:46.876Z",
    "user": {
      "id": "cm0x7y9za0003xyz123456789",
      "username": "username_to_invite",
      "email": "invited@example.com"
    }
  }
}
```

### Get User's Groups
```http
GET /api/groups
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "groups": [
    {
      "id": "cm0x7y9za0001xyz123456789",
      "name": "Study Group Name",
      "description": "Optional description",
      "membership": {
        "role": "OWNER",
        "joinedAt": "2025-09-10T07:38:46.876Z"
      },
      "memberCount": 3,
      "projectCount": 5
    }
  ]
}
```

## Project Management

### Create Project
```http
POST /api/groups/:groupId/projects
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Project Title",
  "description": "Optional project description",
  "dueDate": "2025-09-20T10:00:00Z",
  "priority": "HIGH",
  "status": "PLANNING"
}
```

**Response (201 Created):**
```json
{
  "message": "Project created successfully",
  "project": {
    "id": "cm0x7y9za0002xyz123456789",
    "title": "Project Title",
    "description": "Optional project description",
    "status": "PLANNING",
    "priority": "HIGH",
    "dueDate": "2025-09-20T10:00:00Z",
    "createdAt": "2025-09-10T07:38:46.876Z",
    "groupId": "cm0x7y9za0001xyz123456789",
    "assignedUser": null,
    "group": {
      "id": "cm0x7y9za0001xyz123456789",
      "name": "Study Group Name"
    }
  }
}
```

### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Project Title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-09-25T10:00:00Z",
  "assignedUserId": "cm0x7y9za0000xyz123456789"
}
```

**Response (200 OK):**
```json
{
  "message": "Project updated successfully",
  "project": {
    "id": "cm0x7y9za0002xyz123456789",
    "title": "Updated Project Title",
    "description": "Updated description",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-09-25T10:00:00Z",
    "assignedUser": {
      "id": "cm0x7y9za0000xyz123456789",
      "username": "username",
      "email": "user@example.com"
    },
    "updatedAt": "2025-09-10T08:00:00.000Z"
  }
}
```

### Get Group Projects
```http
GET /api/groups/:groupId/projects
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "projects": [
    {
      "id": "cm0x7y9za0002xyz123456789",
      "title": "Project Title",
      "description": "Project description",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-09-20T10:00:00Z",
      "assignedUser": {
        "id": "cm0x7y9za0000xyz123456789",
        "username": "username"
      },
      "createdAt": "2025-09-10T07:38:46.876Z",
      "group": {
        "id": "cm0x7y9za0001xyz123456789",
        "name": "Study Group Name"
      }
    }
  ]
}
```

### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <jwt_token>
```

**Requirements**: Group membership

**Response (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

## Notifications

### Get User Notifications
```http
GET /api/notifications
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": "cm0x7y9za0004xyz123456789",
      "type": "TASK_ASSIGNED",
      "title": "Task Assigned",
      "message": "You have been assigned to 'Project Title'",
      "isRead": false,
      "createdAt": "2025-09-10T07:38:46.876Z",
      "projectId": "cm0x7y9za0002xyz123456789",
      "groupId": "cm0x7y9za0001xyz123456789"
    }
  ]
}
```

### Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": "cm0x7y9za0004xyz123456789",
    "isRead": true,
    "updatedAt": "2025-09-10T08:00:00.000Z"
  }
}
```

### Mark All Notifications as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

## Real-time Communication (Socket.IO)

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### Join Group Room
```javascript
socket.emit('join-group', groupId);
```

#### Receive Notifications
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

#### Project Updates
```javascript
socket.on('project-updated', (project) => {
  console.log('Project updated:', project);
});
```

#### Task Assignment
```javascript
socket.on('task-assigned', (data) => {
  console.log('Task assigned:', data);
});
```

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
```

### Group
```typescript
{
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  createdAt: string;
  memberships: GroupMembership[];
  projects: Project[];
}
```

### Project
```typescript
{
  id: string;
  title: string;
  description?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignedUser?: User;
  group: Group;
  createdAt: string;
  updatedAt: string;
}
```

### Notification
```typescript
{
  id: string;
  type: 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'GROUP_INVITATION' | 'DUE_DATE_REMINDER';
  title: string;
  message: string;
  isRead: boolean;
  projectId?: string;
  groupId?: string;
  createdAt: string;
}
```

## Role-Based Access Control

### Roles
- **OWNER**: Full group management, can invite users, manage all projects
- **ADMIN**: Can invite users, manage projects, moderate content
- **MEMBER**: Can view content, create/edit assigned projects

### Permissions Matrix
| Action | OWNER | ADMIN | MEMBER |
|--------|--------|--------|---------|
| Create Group | ✓ | ✓ | ✓ |
| Invite Users | ✓ | ✓ | ✗ |
| Create Projects | ✓ | ✓ | ✓ |
| Edit All Projects | ✓ | ✓ | ✗ |
| Edit Assigned Projects | ✓ | ✓ | ✓ |
| Delete Projects | ✓ | ✓ | ✗ |

## Error Handling

### Common HTTP Status Codes

| Code | Description | Example |
|------|-------------|---------|
| 200 | Success | Resource retrieved/updated successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions for the action |
| 404 | Not Found | Resource not found or user not a member |
| 409 | Conflict | Resource already exists (e.g., email taken) |
| 500 | Server Error | Internal server error |

### Error Response Format
```json
{
  "error": "Error message",
  "message": "Detailed description",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Auth endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per authenticated user
- **Real-time events**: 50 events per minute per user

## Testing & Development

### Sample Test Users
After running the seed script:

```json
{
  "users": [
    {
      "email": "alice@example.com",
      "username": "alice",
      "password": "password123"
    },
    {
      "email": "bob@example.com", 
      "username": "bob",
      "password": "password123"
    },
    {
      "email": "charlie@example.com",
      "username": "charlie", 
      "password": "password123"
    }
  ]
}
```

### Postman Collection
A Postman collection is available at `backend/Collaborative-Learning-Platform.postman_collection.json` with pre-configured requests and environment variables.

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-10T07:38:46.876Z",
  "environment": "development"
}
```

## Best Practices

### Authentication
1. Store JWT tokens securely (httpOnly cookies recommended for web apps)
2. Implement token refresh mechanism for long-lived sessions
3. Handle 401 responses by redirecting to login

### Error Handling
1. Always check response status codes
2. Display user-friendly error messages
3. Log detailed errors for debugging

### Real-time Features
1. Handle socket reconnection gracefully
2. Implement offline state management
3. Buffer events when disconnected

### Performance
1. Implement pagination for large datasets
2. Use appropriate caching strategies
3. Minimize API calls with efficient data fetching

This API guide provides comprehensive documentation for integrating with the Collaborative Learning Platform API. For additional support or questions, refer to the codebase documentation or contact the development team.
