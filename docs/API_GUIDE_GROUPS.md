# Learning Groups Management

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
