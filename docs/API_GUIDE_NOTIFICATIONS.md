# Notifications

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
