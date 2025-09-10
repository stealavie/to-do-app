# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Health Check

#### GET /health
Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-10T07:38:46.876Z",
  "environment": "development"
}
```

---

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response (201):**
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

#### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
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

---

### Learning Groups

#### POST /api/groups
Create a new learning group. (Requires authentication)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Study Group Name",
  "description": "Optional description",
  "isPublic": true
}
```

**Response (201):**
```json
{
  "message": "Group created successfully",
  "group": {
    "id": "cm0x7y9za0001xyz123456789",
    "name": "Study Group Name",
    "description": "Optional description",
    "isPublic": true,
    "inviteCode": "cmfdo0x5e00048ixmmpt2j3tz",
    "createdAt": "2025-09-10T07:38:46.876Z",
    "memberships": [
      {
        "userId": "cm0x7y9za0000xyz123456789",
        "groupId": "cm0x7y9za0001xyz123456789",
        "role": "OWNER",
        "joinedAt": "2025-09-10T07:38:46.876Z",
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

#### GET /api/groups/:id
Get group details. (Requires authentication and membership)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "group": {
    "id": "cm0x7y9za0001xyz123456789",
    "name": "Study Group Name",
    "description": "Optional description",
    "isPublic": true,
    "inviteCode": "cmfdo0x5e00048ixmmpt2j3tz",
    "createdAt": "2025-09-10T07:38:46.876Z",
    "memberships": [
      {
        "userId": "cm0x7y9za0000xyz123456789",
        "groupId": "cm0x7y9za0001xyz123456789",
        "role": "OWNER",
        "joinedAt": "2025-09-10T07:38:46.876Z",
        "user": {
          "id": "cm0x7y9za0000xyz123456789",
          "username": "username",
          "email": "user@example.com"
        }
      }
    ],
    "projects": [
      {
        "id": "cm0x7y9za0002xyz123456789",
        "title": "Project Title",
        "description": "Project description",
        "dueDate": "2025-09-20T10:00:00Z",
        "createdAt": "2025-09-10T07:38:46.876Z"
      }
    ]
  }
}
```

#### POST /api/groups/join
Join a group using an invite code. (Requires authentication)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "inviteCode": "cmfdo0x5e00048ixmmpt2j3tz"
}
```

**Response (201):**
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
      "name": "Study Group Name",
      "memberships": [...]
    }
  }
}
```

#### POST /api/groups/:id/invite
Invite a user to the group by username. (Requires authentication and OWNER/ADMIN role)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "username_to_invite"
}
```

**Response (201):**
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
    },
    "group": {
      "id": "cm0x7y9za0001xyz123456789",
      "name": "Study Group Name"
    }
  }
}
```

---

### Projects

#### POST /api/groups/:groupId/projects
Create a new project in a group. (Requires authentication and group membership)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Optional project description",
  "dueDate": "2025-09-20T10:00:00Z"
}
```

**Response (201):**
```json
{
  "message": "Project created successfully",
  "project": {
    "id": "cm0x7y9za0002xyz123456789",
    "title": "Project Title",
    "description": "Optional project description",
    "dueDate": "2025-09-20T10:00:00Z",
    "createdAt": "2025-09-10T07:38:46.876Z",
    "groupId": "cm0x7y9za0001xyz123456789",
    "group": {
      "id": "cm0x7y9za0001xyz123456789",
      "name": "Study Group Name"
    }
  }
}
```

#### GET /api/groups/:groupId/projects
Get all projects in a group. (Requires authentication and group membership)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "projects": [
    {
      "id": "cm0x7y9za0002xyz123456789",
      "title": "Project Title",
      "description": "Optional project description",
      "dueDate": "2025-09-20T10:00:00Z",
      "createdAt": "2025-09-10T07:38:46.876Z",
      "groupId": "cm0x7y9za0001xyz123456789",
      "group": {
        "id": "cm0x7y9za0001xyz123456789",
        "name": "Study Group Name"
      }
    }
  ]
}
```

---

## Error Responses

### Validation Errors (400)
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "error": "Authorization header missing or invalid format"
}
```

### Forbidden (403)
```json
{
  "error": "Only group owners and admins can invite users"
}
```

### Not Found (404)
```json
{
  "error": "Group not found or you are not a member"
}
```

### Conflict (409)
```json
{
  "error": "User already exists",
  "message": "Email already registered"
}
```

### Internal Server Error (500)
```json
{
  "error": "Internal server error"
}
```

## Roles

- **OWNER**: Can invite users, manage group settings, create projects
- **ADMIN**: Can invite users, create projects
- **MEMBER**: Can view group content, create projects

## Sample Data

After running the seed script, you'll have:

- **Users**: 
  - alice@example.com (username: alice)
  - bob@example.com (username: bob)
  - charlie@example.com (username: charlie)
  - All with password: `password123`

- **Group**: "Web Development Study Group"
  - Invite code will be displayed after seeding

- **Projects**: 
  - "Build a Todo App"
  - "Learn TypeScript"
