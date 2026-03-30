import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DayOfWeek, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

const DAY_MAP: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassDto) {
    this.parseTimeSlot(dto.timeSlot);

    return this.prisma.class.create({
      data: dto,
    });
  }

  async findAll(day?: string) {
    const normalizedDay = this.normalizeDay(day);

    const classes = await this.prisma.class.findMany({
      where: normalizedDay ? { dayOfWeek: normalizedDay } : undefined,
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: 'asc' }],
    });

    return classes.map((item) => ({
      ...item,
      currentRegistrations: item._count.registrations,
      _count: undefined,
    }));
  }

  async registerStudent(classId: number, dto: RegisterStudentDto) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!targetClass) {
      throw new NotFoundException('Class not found');
    }

    this.parseTimeSlot(targetClass.timeSlot);

    const classDateDay = this.getDayOfWeekFromDate(dto.classDate);
    if (classDateDay !== targetClass.dayOfWeek) {
      throw new BadRequestException('classDate does not match class dayOfWeek');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const existingSameClass = await this.prisma.classRegistration.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId: dto.studentId,
        },
      },
    });

    if (existingSameClass) {
      throw new ConflictException('Student already registered for this class');
    }

    const currentRegistrations = await this.prisma.classRegistration.count({
      where: { classId },
    });

    if (currentRegistrations >= targetClass.maxStudents) {
      throw new ConflictException('Class is full');
    }

    const existingRegistrations = await this.prisma.classRegistration.findMany({
      where: {
        studentId: dto.studentId,
        class: {
          dayOfWeek: targetClass.dayOfWeek,
        },
      },
      include: {
        class: true,
      },
    });

    const hasConflict = existingRegistrations.some(
      (registration) =>
        registration.classId !== classId &&
        this.hasTimeConflict(targetClass.timeSlot, registration.class.timeSlot),
    );

    if (hasConflict) {
      throw new ConflictException('Student has schedule conflict');
    }

    const now = new Date();
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: {
        studentId: dto.studentId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    const usableSubscription = activeSubscriptions.find(
      (subscription) => subscription.usedSessions < subscription.totalSessions,
    );

    if (!usableSubscription) {
      throw new BadRequestException('No active subscription available');
    }

    const classDate = new Date(`${dto.classDate}T00:00:00.000Z`);

    try {
      const registration = await this.prisma.$transaction(async (tx) => {
        const latestCount = await tx.classRegistration.count({
          where: { classId },
        });

        if (latestCount >= targetClass.maxStudents) {
          throw new ConflictException('Class is full');
        }

        const latestSubscription = await tx.subscription.findUnique({
          where: { id: usableSubscription.id },
        });

        if (
          !latestSubscription ||
          latestSubscription.usedSessions >= latestSubscription.totalSessions ||
          latestSubscription.startDate > now ||
          latestSubscription.endDate < now
        ) {
          throw new BadRequestException('No active subscription available');
        }

        const createdRegistration = await tx.classRegistration.create({
          data: {
            classId,
            studentId: dto.studentId,
            classDate,
            subscriptionIdUsed: latestSubscription.id,
          },
        });

        await tx.subscription.update({
          where: { id: latestSubscription.id },
          data: {
            usedSessions: {
              increment: 1,
            },
          },
        });

        return createdRegistration;
      });

      return registration;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Student already registered for this class');
      }

      throw error;
    }
  }

  private normalizeDay(day?: string): DayOfWeek | undefined {
    if (!day) {
      return undefined;
    }

    const normalized = day.trim().toUpperCase();
    if (!Object.values(DayOfWeek).includes(normalized as DayOfWeek)) {
      throw new BadRequestException(
        'Invalid day. Use MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, or SUNDAY',
      );
    }

    return normalized as DayOfWeek;
  }

  private getDayOfWeekFromDate(dateString: string): DayOfWeek {
    const date = new Date(`${dateString}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid classDate');
    }

    return DAY_MAP[date.getUTCDay()];
  }

  private hasTimeConflict(slotA: string, slotB: string): boolean {
    const a = this.parseTimeSlot(slotA);
    const b = this.parseTimeSlot(slotB);

    return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
  }

  private parseTimeSlot(timeSlot: string) {
    const match = timeSlot.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
    if (!match) {
      throw new BadRequestException('timeSlot must be in HH:mm-HH:mm format');
    }

    const startHour = Number(match[1]);
    const startMinute = Number(match[2]);
    const endHour = Number(match[3]);
    const endMinute = Number(match[4]);

    const isOutOfRange =
      startHour > 23 ||
      endHour > 23 ||
      startMinute > 59 ||
      endMinute > 59 ||
      startHour < 0 ||
      endHour < 0;

    if (isOutOfRange) {
      throw new BadRequestException('timeSlot contains invalid hour or minute');
    }

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('timeSlot end time must be greater than start time');
    }

    return { startMinutes, endMinutes };
  }
}
