# Database Seeding Instructions

This guide explains how to seed your PostgreSQL database with sample data for the collaborative learning platform.

## 📋 Prerequisites

Before running the seed script, ensure you have:

1. **PostgreSQL Database** - Running and accessible
2. **Environment Variables** - Properly configured in `.env` file
3. **Dependencies** - All npm packages installed
4. **Database Schema** - Migrations applied

## 🔧 Setup Steps

### 1. Environment Configuration

Make sure your `.env` file in the `backend` directory contains:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
JWT_SECRET="your-jwt-secret-key"
# Add other required environment variables
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Apply Database Migrations

```bash
npm run db:migrate
```

## 🌱 Seeding the Database

### Option 1: Seed Only (Recommended for First Time)

```bash
npm run db:seed
```

This command will:
- Clear existing data in the correct order (respecting foreign key constraints)
- Create sample users, groups, projects, notifications, and task history
- Display a summary of created records

### Option 2: Reset and Seed (Complete Reset)

```bash
npm run db:reset
```

⚠️ **Warning**: This command will:
- Drop all tables
- Re-run all migrations
- Seed the database with sample data
- **All existing data will be permanently lost**

## 📊 Sample Data Overview

The seed script creates:

### 👥 Users (5 total)
- **alice_dev** (alice@example.com) - Full-stack developer
- **bob_designer** (bob@example.com) - UI/UX designer
- **charlie_pm** (charlie@example.com) - Project manager
- **diana_qa** (diana_qa@example.com) - QA engineer
- **eve_data** (eve@example.com) - Data scientist

**All users have the password**: `password123`

### 📚 Learning Groups (3 total)
1. **Full-Stack Development Team** - Invite Code: `FULLSTACK2024`
2. **AI/ML Research Group** - Invite Code: `AIML2024`
3. **Mobile Development Squad** - Invite Code: `MOBILE2024`

### 📋 Projects (7 total)
- **E-commerce Platform MVP** (High Priority, In Progress)
- **API Documentation & Testing** (Medium Priority, Planning)
- **UI/UX Design System** (Medium Priority, Planning)
- **Sentiment Analysis Model** (High Priority, In Progress)
- **Data Pipeline Optimization** (High Priority, Planning)
- **Cross-Platform Chat App** (High Priority, In Progress)
- **App Store Deployment** (Medium Priority, Done)

### 🔔 Notifications (7 total)
- Task assignments
- Deadline approaching alerts
- Project updates
- Status changes
- Group invitations

### 📈 Task History (6 entries)
- Project start events
- Status changes
- Completion records with time tracking

## 🧪 Testing the Seeded Data

### 1. Using Prisma Studio

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can browse all the seeded data.

### 2. Login with Sample Users

Use any of the sample user credentials to test the authentication system:

```
Email: alice@example.com
Username: alice_dev
Password: password123
```

### 3. Test Group Invitations

Try joining groups using the invite codes:
- `FULLSTACK2024`
- `AIML2024`
- `MOBILE2024`

## 🔄 Re-seeding Data

### If you want to refresh the sample data:

1. **Soft Reset** (keeps schema, replaces data):
   ```bash
   npm run db:seed
   ```

2. **Hard Reset** (drops everything, rebuilds from scratch):
   ```bash
   npm run db:reset
   ```

## 🐛 Troubleshooting

### Common Issues:

1. **"Database does not exist"**
   - Create the database manually in PostgreSQL
   - Check your `DATABASE_URL` in `.env`

2. **"Permission denied"**
   - Ensure your PostgreSQL user has proper permissions
   - Check connection credentials

3. **"Prisma Client not generated"**
   ```bash
   npm run db:generate
   ```

4. **"Migration failed"**
   ```bash
   npm run db:migrate
   ```

5. **"Seed script errors"**
   - Check that all dependencies are installed
   - Verify your database connection
   - Ensure migrations are up to date

### Clear specific data only:

If you want to clear only certain tables, you can modify the seed script or run custom Prisma queries:

```typescript
// Example: Clear only notifications
await prisma.notification.deleteMany();
```

## 📝 Customizing Seed Data

To modify the seed data:

1. Edit `backend/src/scripts/seed.ts`
2. Adjust the sample data according to your needs
3. Run the seed script again

### Key considerations:
- Maintain foreign key relationships
- Use realistic dates (relative to current date)
- Include various data states (pending, in-progress, completed)
- Test with different user roles and permissions

## 🎯 Production Notes

⚠️ **Important**: Never run seeding scripts in production environments. This guide is for development and testing purposes only.

For production:
- Use database migrations only
- Load real user data through proper onboarding flows
- Implement data backup strategies
- Use environment-specific configurations

---

## 📞 Support

If you encounter issues with seeding:

1. Check the console output for specific error messages
2. Verify your database connection
3. Ensure all prerequisites are met
4. Review the Prisma schema for any recent changes

The seed script provides detailed logging to help diagnose any issues during the process.