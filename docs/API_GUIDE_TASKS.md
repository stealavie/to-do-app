# API Guide: Tasks Management

This document describes the Tasks API endpoints for the StudyFlow collaborative learning platform. The Tasks API provides a unified view of all projects/tasks across learning groups with advanced pagination, filtering, and performance optimizations.

## Overview

The Tasks API offers:
- **Unified Task View**: Access all tasks from groups you belong to in one endpoint
- **Advanced Pagination**: Efficient infinite scroll with React Query integration
- **Smart Filtering**: Filter by status, priority, and group
- **Performance Optimization**: localStorage caching and stale-while-revalidate patterns
- **Real-time Statistics**: Task breakdown and progress tracking

## Authentication

All Tasks API endpoints require authentication via JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### GET /api/tasks

Retrieve paginated tasks for the authenticated user across all their learning groups.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `status` | string or array | Filter by task status (`PLANNING`, `IN_PROGRESS`, `DONE`) | `['PLANNING', 'IN_PROGRESS']` |
| `page` | number | Page number (1-based) | `1` |
| `pageSize` | number | Items per page (max 100) | `20` |
| `priority` | string | Filter by priority (`LOW`, `MEDIUM`, `HIGH`) | - |
| `groupId` | string | Filter by specific learning group | - |

**Example Requests:**

```bash
# Get first page of active tasks (default)
GET /api/tasks

# Get high priority tasks from page 2
GET /api/tasks?priority=HIGH&page=2&pageSize=15

# Get completed tasks only
GET /api/tasks?status=DONE

# Get tasks from specific group
GET /api/tasks?groupId=clx123abc&status=PLANNING,IN_PROGRESS
```

**Response Structure:**

```json
{
  "tasks": [
    {
      "id": "clx456def",
      "title": "Complete React Components",
      "description": "Build the user interface components for the dashboard",
      "dueDate": "2025-09-20T10:00:00.000Z",
      "assignedTo": "user123",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "lastEditedBy": "user456",
      "lastEditedAt": "2025-09-13T14:30:00.000Z",
      "createdAt": "2025-09-10T09:00:00.000Z",
      "updatedAt": "2025-09-13T14:30:00.000Z",
      "groupId": "group789",
      "assignedUser": {
        "id": "user123",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "lastEditor": {
        "id": "user456",
        "username": "jane_smith",
        "email": "jane@example.com"
      },
      "group": {
        "id": "group789",
        "name": "Frontend Development Team"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalCount": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `tasks` | array | Array of task objects |
| `pagination.currentPage` | number | Current page number |
| `pagination.pageSize` | number | Number of items per page |
| `pagination.totalCount` | number | Total number of tasks matching filters |
| `pagination.totalPages` | number | Total number of pages |
| `pagination.hasNextPage` | boolean | Whether more pages are available |
| `pagination.hasPreviousPage` | boolean | Whether previous pages exist |

### GET /api/tasks/stats

Get task statistics for the authenticated user across all their learning groups.

**Example Request:**

```bash
GET /api/tasks/stats
```

**Response Structure:**

```json
{
  "planning": 12,
  "inProgress": 8,
  "done": 25,
  "total": 45
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `planning` | number | Number of tasks in PLANNING status |
| `inProgress` | number | Number of tasks in IN_PROGRESS status |
| `done` | number | Number of completed tasks |
| `total` | number | Total number of tasks across all statuses |

## Task Ordering

Tasks are automatically ordered by:
1. **Priority** (DESC): HIGH → MEDIUM → LOW
2. **Due Date** (ASC): Earlier due dates first
3. **Created Date** (DESC): Newest tasks first for same priority/due date

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid page parameter",
  "message": "Page must be a positive integer"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide a valid JWT token"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch tasks",
  "message": "Database connection error"
}
```

## Frontend Integration

### React Query Hook Usage

The Tasks API is designed to work seamlessly with React Query for optimal performance:

```typescript
import { useTasks, useActiveTasks, useTaskStats } from '../hooks/useTasks';

// Basic usage - infinite scroll with active tasks
const { 
  tasks, 
  isLoading, 
  loadMoreTasks, 
  hasNextPage 
} = useActiveTasks();

// High priority tasks only
const highPriorityTasks = useTasks({ 
  priority: 'HIGH', 
  pageSize: 10 
});

// Completed tasks
const completedTasks = useCompletedTasks();

// Statistics
const { data: stats } = useTaskStats();
```

### localStorage Caching

The frontend implementation includes automatic localStorage caching:

```typescript
// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const TASKS_CACHE_KEY = 'tasks_cache';

// Automatic caching after successful API calls
useEffect(() => {
  if (tasks.length > 0) {
    localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(tasks));
    localStorage.setItem('tasks_cache_timestamp', Date.now().toString());
  }
}, [tasks]);
```

### Infinite Scroll Implementation

```typescript
const InfiniteScrollTrigger = ({ onLoadMore, isLoading }) => {
  const triggerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, isLoading]);

  return <div ref={triggerRef} className="h-4" />;
};
```

## Performance Optimizations

### Backend Optimizations

1. **Efficient Pagination**: Uses LIMIT/OFFSET for database queries
2. **Single Query**: Joins user and group data in one query
3. **Smart Filtering**: Database-level filtering reduces data transfer
4. **Proper Indexing**: Indexes on `groupId`, `status`, `priority`, `createdAt`

### Frontend Optimizations

1. **localStorage Caching**: Instant UI loading on app startup
2. **Stale-While-Revalidate**: Shows cached data while fetching fresh data
3. **React Query**: Automatic deduplication and background updates
4. **Infinite Scroll**: Load data only when needed

## Security Considerations

1. **User Isolation**: Users can only access tasks from groups they belong to
2. **JWT Validation**: All endpoints require valid authentication
3. **Input Validation**: Query parameters are validated and sanitized
4. **Rate Limiting**: API calls are rate-limited to prevent abuse

## Example Usage Scenarios

### Dashboard Overview
```typescript
// Show active tasks with statistics
const Dashboard = () => {
  const { tasks, isLoading } = useActiveTasks({ pageSize: 10 });
  const { data: stats } = useTaskStats();

  return (
    <div>
      <TaskStats stats={stats} />
      <TaskList tasks={tasks} loading={isLoading} />
    </div>
  );
};
```

### Group-Specific Tasks
```typescript
// Show tasks for a specific group
const GroupTasks = ({ groupId }) => {
  const { tasks, loadMoreTasks, hasNextPage } = useTasks({ 
    groupId,
    pageSize: 15 
  });

  return (
    <InfiniteTaskList 
      tasks={tasks}
      onLoadMore={loadMoreTasks}
      hasMore={hasNextPage}
    />
  );
};
```

### Priority-Based Filtering
```typescript
// Show high priority tasks across all groups
const HighPriorityTasks = () => {
  const { tasks } = useTasks({ 
    priority: 'HIGH',
    status: ['PLANNING', 'IN_PROGRESS']
  });

  return (
    <UrgentTaskList tasks={tasks} />
  );
};
```

## Migration and Database Schema

The Tasks API leverages the existing Prisma schema:

```sql
-- The Project model serves as "tasks"
model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime? @map("due_date")
  assignedTo  String?   @map("assigned_to")
  priority    Priority @default(MEDIUM)
  status      ProjectStatus @default(PLANNING)
  lastEditedBy String? @map("last_edited_by")
  lastEditedAt DateTime? @map("last_edited_at")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt @map("updated_at")
  groupId     String   @map("group_id")
  
  -- Relations
  group        LearningGroup @relation(fields: [groupId], references: [id])
  assignedUser User?         @relation(fields: [assignedTo], references: [id])
  lastEditor   User?         @relation("ProjectLastEditor", fields: [lastEditedBy], references: [id])
}
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live task updates
2. **Advanced Search**: Full-text search across task titles and descriptions
3. **Bulk Operations**: Update multiple tasks simultaneously
4. **Custom Sorting**: User-defined task ordering preferences
5. **Export/Import**: CSV/JSON export for external tools
6. **Task Dependencies**: Link tasks with prerequisites
7. **Time Tracking**: Built-in time logging for tasks
8. **Notifications**: Smart deadline and assignment notifications

## Troubleshooting

### Common Issues

1. **Empty Task List**: Check if user belongs to any learning groups
2. **Slow Loading**: Verify database indexes are properly created
3. **Cache Issues**: Clear localStorage if stale data persists
4. **Pagination Errors**: Ensure page parameters are valid positive integers

### Debug Endpoints

```bash
# Check user's group memberships
GET /api/groups

# Verify task counts
GET /api/tasks/stats

# Test with minimal parameters
GET /api/tasks?pageSize=1
```

This Tasks API provides a robust foundation for task management within the StudyFlow collaborative learning platform, offering both performance and user experience optimizations.