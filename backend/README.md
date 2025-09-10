# Collaborative Learning Platform Backend

A robust Node.js backend server for a collaborative learning application that allows users to form learning groups, share projects, and collaborate effectively.

## 🚀 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.21+
- **Database**: PostgreSQL 16+
- **ORM**: Prisma 6.10+
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Language**: TypeScript

## 📋 Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes

### Learning Groups
- Create public/private learning groups
- Join groups via invite codes
- Role-based access control (Owner, Admin, Member)
- Invite users to groups

### Projects
- Create and manage projects within groups
- Set due dates for projects
- Group member access control

## 🛠️ Installation

1. **Clone and navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```
Edit `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/collaborative_learning_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
```

4. **Set up PostgreSQL database**:
- Install PostgreSQL locally or use a cloud provider
- Create a database named `collaborative_learning_db`
- Update `DATABASE_URL` in your `.env` file

5. **Generate Prisma client and run migrations**:
```bash
npm run db:generate
npm run db:migrate
```

6. **Seed the database (optional)**:
```bash
npm run db:seed
```

## 🚦 Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in your `.env` file).

## 📡 API Endpoints

### Authentication (`/api/auth`)

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Learning Groups (`/api/groups`)

#### Create a new group
```http
POST /api/groups
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Study Group",
  "description": "A group for collaborative learning",
  "isPublic": true
}
```

#### Get group details
```http
GET /api/groups/:id
Authorization: Bearer <jwt_token>
```

#### Join a group
```http
POST /api/groups/join
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "inviteCode": "group_invite_code"
}
```

#### Invite user to group (Owner/Admin only)
```http
POST /api/groups/:id/invite
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "username": "username_to_invite"
}
```

### Projects (`/api/groups/:groupId/projects`)

#### Create a project
```http
POST /api/groups/:groupId/projects
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Project Title",
  "description": "Project description",
  "dueDate": "2025-09-20T10:00:00Z"
}
```

#### Get all projects in a group
```http
GET /api/groups/:groupId/projects
Authorization: Bearer <jwt_token>
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🗃️ Database Schema

The application uses the following main entities:

- **Users**: Store user account information
- **LearningGroups**: Represent learning groups
- **GroupMembership**: Many-to-many relationship between users and groups with roles
- **Projects**: Store project information within groups

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based auth

## 🧪 Development Tools

- **Prisma Studio**: Database GUI (`npm run db:studio`)
- **TypeScript**: Type safety
- **Hot Reload**: Development server with `tsx watch`

## 📦 Project Structure

```
backend/
├── src/
│   ├── lib/           # Database client
│   ├── middleware/    # Express middleware
│   ├── routes/        # API route handlers
│   ├── schemas/       # Zod validation schemas
│   ├── scripts/       # Database seed scripts
│   ├── utils/         # Utility functions
│   └── server.ts      # Main server file
├── prisma/
│   └── schema.prisma  # Database schema
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Deployment

1. **Build the project**:
```bash
npm run build
```

2. **Set production environment variables**
3. **Run database migrations in production**
4. **Start the server**:
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
