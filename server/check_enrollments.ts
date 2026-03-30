import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: 'student@pec.edu' },
        { name: 'Arjun Patel' }
      ]
    },
    include: {
      studentProfile: true
    }
  });

  if (!user) {
    console.log("No student found with email 'student@pec.edu'");
    return;
  }

  console.log(`Student Found: ${user.name} (ID: ${user.id})`);
  console.log(`Profile: Semester ${user.studentProfile?.semester}, Dept: ${user.studentProfile?.department}`);

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id }
  });

  console.log(`Enrollments Count: ${enrollments.length}`);
  enrollments.forEach(e => {
    console.log(`- Enrolled in: ${e.courseCode} (${e.courseName})`);
  });

  const timetableEntries = await prisma.timetable.findMany({
    where: {
      OR: [
        { department: user.studentProfile?.department },
        { courseId: { in: enrollments.map(e => e.courseId) } }
      ]
    }
  });

  console.log(`Relevant Timetable Entries Count: ${timetableEntries.length}`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
