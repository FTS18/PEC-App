
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.course.count();
  console.log('Course count:', count);
  const courses = await prisma.course.findMany({ take: 5 });
  console.log('Sample courses:', JSON.stringify(courses, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
