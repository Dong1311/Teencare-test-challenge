import 'dotenv/config';
import { DayOfWeek, Gender, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const parentCount = await prisma.parent.count();

  if (parentCount === 0) {
    await prisma.parent.createMany({
      data: [
        {
          name: 'Nguyen Van A',
          phone: '0901000001',
          email: 'nguyenvana@example.com',
        },
        {
          name: 'Tran Thi B',
          phone: '0901000002',
          email: 'tranthib@example.com',
        },
      ],
    });
  }

  const parents = await prisma.parent.findMany({
    orderBy: { id: 'asc' },
  });

  const studentCount = await prisma.student.count();
  if (studentCount === 0 && parents.length >= 2) {
    await prisma.student.createMany({
      data: [
        {
          name: 'Nguyen Minh Khang',
          dob: new Date('2013-05-12'),
          gender: Gender.MALE,
          currentGrade: 'Grade 6',
          parentId: parents[0].id,
        },
        {
          name: 'Nguyen Bao Anh',
          dob: new Date('2015-09-20'),
          gender: Gender.FEMALE,
          currentGrade: 'Grade 4',
          parentId: parents[0].id,
        },
        {
          name: 'Tran Gia Huy',
          dob: new Date('2014-11-03'),
          gender: Gender.MALE,
          currentGrade: 'Grade 5',
          parentId: parents[1].id,
        },
      ],
    });
  }

  const classCount = await prisma.class.count();
  if (classCount === 0) {
    await prisma.class.createMany({
      data: [
        {
          name: 'Math Monday',
          subject: 'Math',
          dayOfWeek: DayOfWeek.MONDAY,
          timeSlot: '09:00-10:30',
          teacherName: 'Ms. Lan',
          maxStudents: 20,
        },
        {
          name: 'English Wednesday',
          subject: 'English',
          dayOfWeek: DayOfWeek.WEDNESDAY,
          timeSlot: '14:00-15:30',
          teacherName: 'Mr. Phong',
          maxStudents: 15,
        },
        {
          name: 'Science Friday',
          subject: 'Science',
          dayOfWeek: DayOfWeek.FRIDAY,
          timeSlot: '16:00-17:30',
          teacherName: 'Ms. Hoa',
          maxStudents: 18,
        },
      ],
    });
  }

  const students = await prisma.student.findMany({
    orderBy: { id: 'asc' },
  });

  const subscriptionCount = await prisma.subscription.count();
  if (subscriptionCount === 0 && students.length >= 2) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 2);

    await prisma.subscription.createMany({
      data: [
        {
          studentId: students[0].id,
          packageName: '12-session package',
          startDate,
          endDate,
          totalSessions: 12,
          usedSessions: 1,
        },
        {
          studentId: students[1].id,
          packageName: '8-session package',
          startDate,
          endDate,
          totalSessions: 8,
          usedSessions: 0,
        },
      ],
    });
  }

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
