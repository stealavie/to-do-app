import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        username: 'alice',
        password: await hashPassword('password123')
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        username: 'bob',
        password: await hashPassword('password123')
      }
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        username: 'charlie',
        password: await hashPassword('password123')
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create a sample learning group
  const group = await prisma.learningGroup.create({
    data: {
      name: 'Web Development Study Group',
      description: 'A group for learning modern web development technologies',
      memberships: {
        create: [
          {
            userId: users[0].id,
            role: 'OWNER'
          },
          {
            userId: users[1].id,
            role: 'MEMBER'
          }
        ]
      }
    },
    include: {
      memberships: true
    }
  });

  console.log(`✅ Created learning group: ${group.name}`);

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'Build a Todo App',
        description: 'Create a full-stack todo application with React and Node.js',
        dueDate: new Date('2025-09-20'),
        groupId: group.id
      }
    }),
    prisma.project.create({
      data: {
        title: 'Learn TypeScript',
        description: 'Study TypeScript fundamentals and advanced concepts',
        dueDate: new Date('2025-09-25'),
        groupId: group.id
      }
    })
  ]);

  console.log(`✅ Created ${projects.length} projects`);

  console.log('🎉 Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`Users: ${users.length}`);
  console.log(`Groups: 1`);
  console.log(`Projects: ${projects.length}`);
  console.log(`\n🔗 Group invite code: ${group.inviteCode}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
