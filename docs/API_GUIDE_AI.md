# Gemini AI Assistant

The following endpoints are used to power the Gemini AI assistant features.

### Generate Tasks
```http
POST /api/ai/generate-tasks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "projectId": "cm0x7y9za0002xyz123456789",
  "description": "A project to build a full-stack web application for a library management system."
}
```
**Response (200 OK):**
```json
{
  "suggestedTasks": [
    { "title": "Design the database schema", "priority": "HIGH" },
    { "title": "Set up the backend server with Express", "priority": "HIGH" },
    { "title": "Implement user authentication endpoints", "priority": "MEDIUM" },
    { "title": "Create the frontend UI for book browsing", "priority": "MEDIUM" }
  ]
}
```

### Suggest Deadline
```http
POST /api/ai/suggest-deadline
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "groupId": "cm0x7y9za0001xyz123456789",
  "taskComplexity": "HIGH"
}
```
**Response (200 OK):**
```json
{
  "suggestedDueDate": "2025-10-15T17:00:00Z"
}
```

### Summarize Progress
```http
POST /api/ai/summarize-progress
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "projectId": "cm0x7y9za0002xyz123456789",
  "timeframe": "7d"
}
```
**Response (200 OK):**
```json
{
  "summary": "Over the last 7 days, the team has completed 5 tasks, including the implementation of the core authentication feature. The main blocker is currently the integration with the payment gateway."
}
```

### Get Learning Resources
```http
POST /api/ai/recommend-resources
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "keywords": ["React", "TypeScript", "State Management"]
}
```
**Response (200 OK):**
```json
{
  "resources": [
    { "title": "Official React Documentation", "url": "https://react.dev/" },
    { "title": "TypeScript for React Beginners", "url": "https://www.typescriptlang.org/docs/handbook/react.html" },
    { "title": "Zustand - A minimal state management library", "url": "https://zustand-demo.pmnd.rs/" }
  ]
}
```
