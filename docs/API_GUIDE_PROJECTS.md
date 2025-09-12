# Project Management

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
