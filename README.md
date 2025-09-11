# To-Do App – Preliminary Assignment Submission
⚠️ Please complete **all sections marked with the ✍️ icon** — these are required for your submission.

👀 Please Check ASSIGNMENT.md file in this repository for assignment requirements.

## 🚀 Project Setup & Usage
**How to install and run your project:**  
✍️  
**Backend**
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up environment variables by copying the example file: `cp .env.example .env`
4. Edit the `.env` file with your PostgreSQL database URL and a JWT secret.
5. Apply database migrations: `npm run db:migrate`
6. (Optional) Seed the database with initial data: `npm run db:seed`
7. Start the development server: `npm run dev`

**Frontend**
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the backend API URL: `echo "VITE_API_URL=http://localhost:3000" > .env`
4. Start the development server: `npm run dev`


## 🔗 Deployed Web URL or APK file
✍️ Not applicable for this project. The application is designed to be run locally.

## 🎥 Demo Video
**Demo video link (≤ 2 minutes):**  
📌 **Video Upload Guideline:** when uploading your demo video to YouTube, please set the visibility to **Unlisted**.  
- “Unlisted” videos can only be viewed by users who have the link.  
- The video will not appear in search results or on your channel.  
- Share the link in your README so mentors can access it.  

✍️ No demo video available.

## 📖 Function Manual
✍️ The **StudyFlow** platform provides a comprehensive suite of features for collaborative learning:
- **User Authentication**: Secure user registration and login system using JWT.
- **Group Management**: Users can create new learning groups, which generates a unique invite code. Other users can join existing groups using this code.
- **Project Collaboration**: Within groups, members can create and manage shared projects, including setting names, descriptions, and deadlines.
- **Real-time Updates**: The interface uses modern data fetching strategies to ensure that all information is kept up-to-date across clients, providing a seamless collaborative experience.

## 🛠 Technology Stack and Implementation Methods
✍️ 
### Frontend
- **React 19** with **TypeScript** for a robust, type-safe component-based architecture.
- **Vite** for an optimized and fast development experience.
- **Tailwind CSS** for rapid, utility-first styling.
- **React Router** for client-side routing and navigation.
- **React Query** for efficient server state management, caching, and data synchronization.
- **Axios** for making HTTP requests to the backend API.

### Backend
- **Node.js** with **Express** for building a scalable and efficient RESTful API.
- **TypeScript** to ensure type safety and improve code quality.
- **Prisma** as the ORM for seamless and safe database access with PostgreSQL.
- **JSON Web Tokens (JWT)** for securing API endpoints and managing user sessions.
- **Zod** for rigorous input validation to prevent invalid data.
- **bcryptjs** for securely hashing user passwords.

## 🗄 Database structure (when used)
✍️ The database schema is managed by Prisma and consists of the following main models:
- **User**: Stores user account information, including credentials and profile details.
- **Group**: Represents a learning group where users can collaborate. Each group has a unique invite code.
- **GroupMember**: A mapping table that links users to groups and defines their roles (e.g., owner, member).
- **Project**: Represents a project within a group, containing details like its title, description, and due date.
- **Notification**: Stores notifications for users, such as project deadline reminders.

## 🧠 Reflection

### What’s special about this app?  
✍️ This application stands out by focusing on the core tenets of collaborative learning. It's not just another to-do list; it's a structured environment where students and team members can organize their work in a shared context. The real-time nature of the frontend ensures that all users have a consistent view of the project's status, fostering better communication and teamwork. The modern, type-safe technology stack (React/Node.js with TypeScript) makes the platform robust, scalable, and maintainable.

### If you had more time, what would you expand?  
✍️ Given more time, I would expand the platform's feature set to include:
- **Real-time Chat**: A chat feature within each group to allow for instant communication.
- **Granular Task Management**: A more detailed task system within projects, including sub-tasks, assignments to specific users, and status tracking (e.g., To Do, In Progress, Done).
- **Calendar View**: A visual calendar that displays all project deadlines to help teams manage their time effectively.
- **File Sharing**: The ability to upload and attach files to projects and tasks.
- **Third-Party Integrations**: Connections to services like Google Drive, GitHub, or Figma to centralize resources.

### If you integrate AI APIs more for your app, what would you do?  
✍️ Integrating AI could significantly enhance the platform's value:
- **AI Task Generation**: An AI could analyze a project description and automatically suggest a breakdown of tasks and sub-tasks.
- **Smart Scheduling**: AI could recommend project deadlines based on the team's current workload and past performance.
- **Progress Summarization**: An AI assistant could generate daily or weekly progress summaries for teams or instructors, highlighting accomplishments and potential blockers.
- **Learning Resource Recommendations**: Based on the topics of the projects, an AI could suggest relevant articles, tutorials, and documentation to aid the learning process.

## ✅ Checklist
- [✅] Code runs without errors  
- [✅] All required features implemented (add/edit/delete/complete tasks)  
- [✅] All ✍️ sections are filled
