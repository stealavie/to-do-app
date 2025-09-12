# Real-time Communication (Socket.IO)

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
