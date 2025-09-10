# StudyFlow - Collaborative Learning Platform

A modern collaborative learning platform that enables students and teams to manage projects, share knowledge, and track progress together. Built with React + TypeScript frontend and Node.js + Prisma backend.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **Authentication** - Secure JWT-based auth with context management
- **Group Management** - Create, join, and manage learning groups
- **Project Collaboration** - Shared projects with due dates and descriptions
- **Real-time Updates** - React Query for efficient data synchronization
- **Responsive Design** - Works seamlessly on desktop and mobile

### Backend (Node.js + Prisma)
- **RESTful API** - Well-structured REST endpoints
- **Database** - PostgreSQL with Prisma ORM
- **Authentication** - JWT tokens with bcrypt password hashing
- **Security** - Helmet, CORS, rate limiting, and input validation
- **Group System** - Role-based permissions (Owner, Admin, Member)
- **Invite System** - Secure group invitations with unique codes

## 🏗️ Architecture

### Database Schema
- **Users** - Authentication and profile information
- **Learning Groups** - Collaborative spaces with privacy settings
- **Group Memberships** - User roles and permissions
- **Projects** - Shared assignments and deadlines

### API Endpoints
```
Authentication:
POST /api/auth/register - Create new account
POST /api/auth/login    - Sign in to account

Groups:
GET  /api/groups           - Get user's groups
POST /api/groups           - Create new group
GET  /api/groups/:id       - Get group details
POST /api/groups/join      - Join group with invite code
POST /api/groups/:id/invite - Invite user to group

Projects:
GET  /api/groups/:groupId/projects    - Get group projects
POST /api/groups/:groupId/projects    - Create new project
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for server state management
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM with PostgreSQL
- **JWT** for authentication
- **Zod** for input validation
- **bcryptjs** for password hashing

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
echo "VITE_API_URL=http://localhost:3000" > .env

# Start development server
npm run dev
```

### 3. Access the Application
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Health: http://localhost:3000/health

## 📁 Project Structure

```
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Authentication & validation
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── utils/          # Helper functions
│   │   └── lib/            # Database connection
│   ├── prisma/             # Database schema & migrations
│   └── tests/              # API tests
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── auth/          # Login & registration
│   │   ├── groups/        # Group management
│   │   ├── layout/        # App layout
│   │   └── ui/            # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── services/          # API service layer
│   └── types/             # TypeScript definitions
└── public/                # Static assets
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Configured for frontend domain
- **Input Validation** - Zod schemas for all endpoints
- **SQL Injection Protection** - Prisma ORM parameterized queries

## 🎯 Key Features

### User Authentication
- Secure registration and login
- JWT token management
- Automatic token refresh
- Protected routes

### Group Management
- Create public or private groups
- Invite system with unique codes
- Role-based permissions
- Group statistics and analytics

### Project Collaboration
- Create shared projects with deadlines
- Track project progress
- Due date notifications
- Project completion status

### Responsive Design
- Mobile-first approach
- Tailwind CSS utilities
- Modern component design
- Accessible UI patterns

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
# or run API tests
./tests/api-test.sh
```

### Frontend Tests
```bash
npm run test
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run `npm run build`
4. Deploy to your hosting provider

### Frontend Deployment
1. Update `VITE_API_URL` to production API
2. Run `npm run build`
3. Deploy `dist/` folder to static hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙋‍♂️ Support

For questions or issues:
1. Check the API documentation in `backend/API.md`
2. Review the implementation summary in `backend/IMPLEMENTATION_SUMMARY.md`
3. Open an issue on GitHub
