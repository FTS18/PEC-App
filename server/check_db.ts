import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log('Users in PostgreSQL database:');
  users.forEach((u) => {
    console.log(`- ${u.email} (${u.role ?? 'no-role'})`);
  });

  if (users.length === 0) {
    console.log('No users found! Database might not be seeded.');
  }

  const [courses, enrollments, messages, timetable, grades] = await Promise.all([
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.message.count(),
    prisma.timetable.count(),
    prisma.grade.count(),
  ]);

  console.log('\nQuick counts:');
  console.log(`- courses: ${courses}`);
  console.log(`- enrollments: ${enrollments}`);
  console.log(`- messages: ${messages}`);
  console.log(`- timetable: ${timetable}`);
  console.log(`- grades: ${grades}`);
}

checkUsers().finally(() => prisma.$disconnect());
