import { PrismaClient, Role, Priority, ProjectStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, addHours, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order due to foreign key constraints)
  console.log('🧹 Cleaning existing data...');
  await prisma.taskHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.project.deleteMany();
  await prisma.groupMembership.deleteMany();
  await prisma.learningGroup.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        username: 'alice_dev',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        username: 'bob_designer',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        username: 'charlie_pm',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        username: 'diana_qa',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        email: 'eve@example.com',
        username: 'eve_data',
        password: hashedPassword,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create Learning Groups
  console.log('📚 Creating learning groups...');
  const groups = await Promise.all([
    prisma.learningGroup.create({
      data: {
        name: 'Full-Stack Development Team',
        description: 'A collaborative group focused on building modern web applications using React, Node.js, and PostgreSQL.',
        inviteCode: 'FULLSTACK2024',
      },
    }),
    prisma.learningGroup.create({
      data: {
        name: 'AI/ML Research Group',
        description: 'Exploring machine learning algorithms and AI applications in real-world projects.',
        inviteCode: 'AIML2024',
      },
    }),
    prisma.learningGroup.create({
      data: {
        name: 'Mobile Development Squad',
        description: 'Building cross-platform mobile applications with React Native and Flutter.',
        inviteCode: 'MOBILE2024',
      },
    }),
  ]);

  console.log(`✅ Created ${groups.length} learning groups`);

  // Create Group Memberships
  console.log('🤝 Creating group memberships...');
  const memberships = [
    // Full-Stack Development Team
    { userId: users[0].id, groupId: groups[0].id, role: Role.OWNER },
    { userId: users[1].id, groupId: groups[0].id, role: Role.ADMIN },
    { userId: users[2].id, groupId: groups[0].id, role: Role.MEMBER },
    { userId: users[3].id, groupId: groups[0].id, role: Role.MEMBER },
    
    // AI/ML Research Group
    { userId: users[4].id, groupId: groups[1].id, role: Role.OWNER },
    { userId: users[0].id, groupId: groups[1].id, role: Role.MEMBER },
    { userId: users[2].id, groupId: groups[1].id, role: Role.MEMBER },
    
    // Mobile Development Squad
    { userId: users[1].id, groupId: groups[2].id, role: Role.OWNER },
    { userId: users[3].id, groupId: groups[2].id, role: Role.ADMIN },
    { userId: users[4].id, groupId: groups[2].id, role: Role.MEMBER },
  ];

  await Promise.all(
    memberships.map(membership =>
      prisma.groupMembership.create({ data: membership })
    )
  );

  console.log(`✅ Created ${memberships.length} group memberships`);

  // Create Projects
  console.log('📋 Creating projects...');
  const projects = await Promise.all([
    // Full-Stack Development Team Projects
    prisma.project.create({
      data: {
        title: 'E-commerce Platform MVP',
        description: 'Build a minimum viable product for an e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.',
        dueDate: addDays(new Date(), 14),
        assignedTo: users[1].id,
        priority: Priority.HIGH,
        status: ProjectStatus.IN_PROGRESS,
        lastEditedBy: users[0].id,
        lastEditedAt: subDays(new Date(), 1),
        groupId: groups[0].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'API Documentation & Testing',
        description: 'Create comprehensive API documentation using Swagger/OpenAPI and implement automated testing suite with Jest and Supertest.',
        dueDate: addDays(new Date(), 7),
        assignedTo: users[2].id,
        priority: Priority.MEDIUM,
        status: ProjectStatus.PLANNING,
        lastEditedBy: users[2].id,
        lastEditedAt: subDays(new Date(), 2),
        groupId: groups[0].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'UI/UX Design System',
        description: 'Develop a consistent design system with reusable components, color schemes, typography, and interaction patterns.',
        dueDate: addDays(new Date(), 21),
        assignedTo: users[3].id,
        priority: Priority.MEDIUM,
        status: ProjectStatus.PLANNING,
        groupId: groups[0].id,
      },
    }),

    // AI/ML Research Group Projects
    prisma.project.create({
      data: {
        title: 'Sentiment Analysis Model',
        description: 'Train and deploy a sentiment analysis model using transformer architecture for social media content analysis.',
        dueDate: addDays(new Date(), 30),
        assignedTo: users[4].id,
        priority: Priority.HIGH,
        status: ProjectStatus.IN_PROGRESS,
        lastEditedBy: users[4].id,
        lastEditedAt: addHours(new Date(), -6),
        groupId: groups[1].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Data Pipeline Optimization',
        description: 'Optimize the existing data processing pipeline for better performance and scalability using Apache Airflow.',
        dueDate: addDays(new Date(), 10),
        assignedTo: users[0].id,
        priority: Priority.HIGH,
        status: ProjectStatus.PLANNING,
        groupId: groups[1].id,
      },
    }),

    // Mobile Development Squad Projects
    prisma.project.create({
      data: {
        title: 'Cross-Platform Chat App',
        description: 'Develop a real-time chat application using React Native with features like group chats, file sharing, and push notifications.',
        dueDate: addDays(new Date(), 25),
        assignedTo: users[1].id,
        priority: Priority.HIGH,
        status: ProjectStatus.IN_PROGRESS,
        lastEditedBy: users[1].id,
        lastEditedAt: addHours(new Date(), -3),
        groupId: groups[2].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'App Store Deployment',
        description: 'Prepare and deploy the mobile application to both Google Play Store and Apple App Store with proper metadata and assets.',
        dueDate: addDays(new Date(), 5),
        assignedTo: users[3].id,
        priority: Priority.MEDIUM,
        status: ProjectStatus.DONE,
        lastEditedBy: users[3].id,
        lastEditedAt: subDays(new Date(), 1),
        groupId: groups[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${projects.length} projects`);

  // Create Task History
  console.log('📈 Creating task history...');
  const taskHistories = [
    // E-commerce Platform MVP history
    {
      projectId: projects[0].id,
      eventType: 'started',
      userId: users[1].id,
      createdAt: subDays(new Date(), 5),
    },
    {
      projectId: projects[0].id,
      eventType: 'status_changed',
      fromStatus: 'PLANNING',
      toStatus: 'IN_PROGRESS',
      userId: users[1].id,
      createdAt: subDays(new Date(), 5),
    },

    // App Store Deployment history
    {
      projectId: projects[6].id,
      eventType: 'started',
      userId: users[3].id,
      createdAt: subDays(new Date(), 8),
    },
    {
      projectId: projects[6].id,
      eventType: 'status_changed',
      fromStatus: 'PLANNING',
      toStatus: 'IN_PROGRESS',
      userId: users[3].id,
      createdAt: subDays(new Date(), 8),
    },
    {
      projectId: projects[6].id,
      eventType: 'completed',
      actualTimeMinutes: 480, // 8 hours
      userId: users[3].id,
      createdAt: subDays(new Date(), 1),
    },
    {
      projectId: projects[6].id,
      eventType: 'status_changed',
      fromStatus: 'IN_PROGRESS',
      toStatus: 'DONE',
      userId: users[3].id,
      createdAt: subDays(new Date(), 1),
    },
  ];

  await Promise.all(
    taskHistories.map(history =>
      prisma.taskHistory.create({ data: history })
    )
  );

  console.log(`✅ Created ${taskHistories.length} task history entries`);

  // Create Notifications
  console.log('🔔 Creating notifications...');
  const notifications = [
    // Task assigned notifications
    {
      userId: users[1].id,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: 'You have been assigned to work on "E-commerce Platform MVP"',
      isRead: false,
      alertType: 'standard',
      projectId: projects[0].id,
      groupId: groups[0].id,
      createdAt: subDays(new Date(), 5),
      metadata: {
        assignedBy: users[0].id,
        priority: 'HIGH',
      },
    },
    {
      userId: users[2].id,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: 'You have been assigned to work on "API Documentation & Testing"',
      isRead: true,
      alertType: 'standard',
      projectId: projects[1].id,
      groupId: groups[0].id,
      createdAt: subDays(new Date(), 4),
      metadata: {
        assignedBy: users[0].id,
        priority: 'MEDIUM',
      },
    },

    // Deadline approaching notifications
    {
      userId: users[1].id,
      type: NotificationType.DEADLINE_APPROACHING,
      title: 'Deadline Approaching',
      message: 'E-commerce Platform MVP is due in 2 weeks. Make sure to stay on track!',
      isRead: false,
      alertType: 'deadline_critical',
      projectId: projects[0].id,
      groupId: groups[0].id,
      createdAt: addHours(new Date(), -12),
      metadata: {
        daysRemaining: 14,
        priority: 'HIGH',
      },
    },
    {
      userId: users[2].id,
      type: NotificationType.DEADLINE_APPROACHING,
      title: 'Deadline Approaching',
      message: 'API Documentation & Testing is due in 1 week. Time to get started!',
      isRead: false,
      alertType: 'smart_start_reminder',
      projectId: projects[1].id,
      groupId: groups[0].id,
      createdAt: addHours(new Date(), -6),
      metadata: {
        daysRemaining: 7,
        priority: 'MEDIUM',
      },
    },

    // Project updated notifications
    {
      userId: users[0].id,
      type: NotificationType.PROJECT_UPDATED,
      title: 'Project Updated',
      message: 'Bob updated the E-commerce Platform MVP project',
      isRead: true,
      alertType: 'standard',
      projectId: projects[0].id,
      groupId: groups[0].id,
      createdAt: subDays(new Date(), 1),
      metadata: {
        updatedBy: users[1].id,
        updatedFields: ['description', 'lastEditedAt'],
      },
    },

    // Status changed notifications
    {
      userId: users[1].id,
      type: NotificationType.STATUS_CHANGED,
      title: 'Project Status Changed',
      message: 'Cross-Platform Chat App status changed to In Progress',
      isRead: false,
      alertType: 'standard',
      projectId: projects[5].id,
      groupId: groups[2].id,
      createdAt: addHours(new Date(), -3),
      metadata: {
        oldStatus: 'PLANNING',
        newStatus: 'IN_PROGRESS',
        changedBy: users[1].id,
      },
    },

    // Group invitation notifications
    {
      userId: users[4].id,
      type: NotificationType.GROUP_INVITATION,
      title: 'Group Invitation',
      message: 'You have been invited to join Mobile Development Squad',
      isRead: true,
      alertType: 'standard',
      groupId: groups[2].id,
      createdAt: subDays(new Date(), 3),
      metadata: {
        invitedBy: users[1].id,
        role: 'MEMBER',
      },
    },
  ];

  await Promise.all(
    notifications.map(notification =>
      prisma.notification.create({ data: notification })
    )
  );

  console.log(`✅ Created ${notifications.length} notifications`);

  // Summary
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Learning Groups: ${groups.length}`);
  console.log(`   - Group Memberships: ${memberships.length}`);
  console.log(`   - Projects: ${projects.length}`);
  console.log(`   - Task History Entries: ${taskHistories.length}`);
  console.log(`   - Notifications: ${notifications.length}`);
  
  console.log('\n👤 Sample User Credentials:');
  console.log('   Email: alice@example.com | Username: alice_dev | Password: password123');
  console.log('   Email: bob@example.com | Username: bob_designer | Password: password123');
  console.log('   Email: charlie@example.com | Username: charlie_pm | Password: password123');
  console.log('   Email: diana@example.com | Username: diana_qa | Password: password123');
  console.log('   Email: eve@example.com | Username: eve_data | Password: password123');

  console.log('\n🔑 Sample Group Invite Codes:');
  console.log('   - FULLSTACK2024 (Full-Stack Development Team)');
  console.log('   - AIML2024 (AI/ML Research Group)');
  console.log('   - MOBILE2024 (Mobile Development Squad)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });