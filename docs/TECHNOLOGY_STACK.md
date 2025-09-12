# Technology Stack

## Overview
This is a full-stack collaborative learning platform built for the Naver Vietnam AI Hackathon. The application enables users to create learning groups, manage projects, and collaborate effectively with real-time notifications and task management capabilities.

## Frontend Technologies

### Core Framework & Build Tools
- **React 19.0.0** - Latest React version with modern features and improved performance
- **Vite 6.0.1** - Fast build tool and development server with hot module replacement
- **TypeScript 5.6.2** - Type-safe JavaScript for better development experience and code quality

### UI & Styling
- **Tailwind CSS 3.4.14** - Utility-first CSS framework for rapid UI development
- **PostCSS 8.5.8** - CSS post-processor for autoprefixer and other transformations
- **Lucide React 0.454.0** - Beautiful icon library with React components

### State Management & Data Fetching
- **React Router DOM 6.28.0** - Declarative routing for React applications
- **TanStack Query (React Query) 5.59.16** - Powerful data synchronization for React
- **Axios 1.7.7** - Promise-based HTTP client for API requests

### Development & Quality Tools
- **ESLint 9.14.0** - JavaScript/TypeScript linter with React and TypeScript plugins
- **TypeScript ESLint Parser & Plugin** - TypeScript-specific linting rules
- **React Hooks ESLint Plugin** - React Hooks specific linting rules

## Backend Technologies

### Runtime & Framework
- **Node.js** - JavaScript runtime environment
- **Express.js 4.21.1** - Fast, unopinionated web framework for Node.js
- **TypeScript 5.6.3** - Type-safe JavaScript for server-side development

### Database & ORM
- **PostgreSQL** - Robust, open-source relational database
- **Prisma 5.20.0** - Next-generation TypeScript ORM
- **Prisma Client** - Auto-generated, type-safe database client

### Authentication & Security
- **JSON Web Tokens (jsonwebtoken) 9.0.2** - Stateless authentication mechanism
- **bcryptjs 2.4.3** - Password hashing library
- **CORS 2.8.5** - Cross-Origin Resource Sharing middleware

### Real-time Communication
- **Socket.IO 4.8.0** - Real-time bidirectional event-based communication
- **Socket.IO Client** - Client-side Socket.IO implementation

### Validation & Data Processing
- **Zod 3.23.8** - TypeScript-first schema declaration and validation library
- **Express Rate Limit 7.4.1** - Rate limiting middleware for Express

### Development Tools
- **ts-node 10.9.2** - TypeScript execution environment for Node.js
- **Nodemon 3.1.7** - Development utility that automatically restarts the server
- **ESLint & TypeScript ESLint** - Code quality and consistency tools

## Development Environment

### Package Management
- **npm** - Package manager for dependency management

### Code Quality & Standards
- **ESLint Configuration**:
  - TypeScript integration
  - React-specific rules
  - React Hooks validation
  - Import/export validation
  - Code formatting standards

### Database Management
- **Prisma Migrations** - Version-controlled database schema changes
- **Prisma Studio** - Visual database browser and editor (available via `npx prisma studio`)

## Architecture Patterns

### Frontend Architecture
- **Component-Based Design** - Reusable React components with clear separation of concerns
- **Custom Hooks** - Encapsulated stateful logic (`useAuth`, `useNotifications`, `useSocket`)
- **Context API** - Global state management for authentication, notifications, and real-time data
- **Utility Functions** - Shared business logic for formatting, validation, and calculations
- **Type-Safe API Layer** - Strongly typed service layer with Axios interceptors

### Backend Architecture
- **RESTful API Design** - Clean, resource-based API endpoints
- **Middleware Pattern** - Authentication, error handling, and CORS middleware
- **Service Layer** - Business logic separation from route handlers
- **Database-First Design** - Prisma schema-driven development with type safety

### Real-time Features
- **Socket.IO Integration** - Bidirectional communication for live notifications
- **Event-Driven Architecture** - Decoupled notification system
- **Optimistic Updates** - Client-side state updates with server synchronization

## Deployment & Infrastructure

### Database
- **PostgreSQL** - Production database with Prisma ORM
- **Connection Pooling** - Efficient database connection management
- **Migrations** - Version-controlled schema evolution

### Environment Configuration
- **Environment Variables** - Secure configuration management
- **Docker Support** - Containerized development and deployment
- **Cross-Platform Compatibility** - Supports Windows, macOS, and Linux

### Performance Optimizations
- **Vite Build Optimization** - Fast builds and optimized bundles
- **React Query Caching** - Intelligent data caching and synchronization
- **Code Splitting** - Lazy loading for optimal performance
- **TypeScript Compilation** - Optimized builds with type checking

## Development Workflow

### Getting Started
1. **Prerequisites**: Node.js 18+, PostgreSQL, npm
2. **Installation**: `npm install` in both frontend and backend directories
3. **Database Setup**: Configure PostgreSQL and run Prisma migrations
4. **Development**: Start both frontend and backend development servers

### Available Scripts
- **Frontend**:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run lint` - Run ESLint
  - `npm run preview` - Preview production build

- **Backend**:
  - `npm run dev` - Start development server with hot reload
  - `npm run build` - Compile TypeScript
  - `npm run start` - Start production server
  - `npx prisma migrate dev` - Run database migrations
  - `npx prisma generate` - Generate Prisma client

### Code Quality Standards
- **TypeScript Strict Mode** - Enhanced type checking
- **ESLint Configuration** - Consistent code style and quality
- **Prisma Type Safety** - Database operations with compile-time validation
- **Component Documentation** - JSDoc comments for all public interfaces

This technology stack provides a modern, scalable, and maintainable foundation for collaborative learning applications with real-time features and robust data management capabilities.
