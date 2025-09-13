# API Guide: Project Source

This document provides an overview of the new data models and backend services introduced in the "task-UI-enhance" feature.

## Data Models

### `TaskHistory`

The `TaskHistory` model was added to track project-related events, enabling analytics on user productivity.

-   `projectId`: The ID of the project this history entry belongs to.
-   `eventType`: The type of event (e.g., 'started', 'completed').
-   `actualTimeMinutes`: The time taken to complete a task.
-   `fromStatus`, `toStatus`: For status change events.
-   `userId`: The user who performed the action.

### `Project` Model Enhancements

The `Project` model was updated with new fields for advanced task management:

-   `priority`: The priority of the project (`LOW`, `MEDIUM`, `HIGH`).
-   `status`: The current status of the project (`PLANNING`, `IN_PROGRESS`, `DONE`).

## Backend Services

### Smart Notification Scheduler

A new service, `NotificationScheduler`, has been implemented to send intelligent notifications to users.

-   **Proactive Reminders**: The scheduler analyzes user habits and project deadlines to send timely reminders.
-   **User Analytics**: It uses a `userAnalytics` utility to calculate metrics like procrastination coefficient and average completion time.
-   **Notification Types**: It can send different types of alerts, such as "smart start reminders" and "critical deadline alerts."

### API Endpoint Enhancements

The projects API endpoints under `/api/groups/:groupId/projects` have been updated to support the new data fields:

-   **Create and Update**: You can now set `priority` and `status` when creating or updating a project.
-   **Filtering**: The `GET /api/groups/:groupId/projects` endpoint now supports filtering projects by `priority` and `status`.
