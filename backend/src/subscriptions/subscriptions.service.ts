import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UseSubscriptionDto } from './dto/use-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubscriptionDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('endDate must be after or equal to startDate');
    }

    const usedSessions = dto.usedSessions ?? 0;

    if (usedSessions > dto.totalSessions) {
      throw new BadRequestException('usedSessions cannot be greater than totalSessions');
    }

    return this.prisma.subscription.create({
      data: {
        studentId: dto.studentId,
        packageName: dto.packageName,
        startDate,
        endDate,
        totalSessions: dto.totalSessions,
        usedSessions,
      },
    });
  }

  async useSubscription(id: number, dto: UseSubscriptionDto) {
    const sessions = dto.sessions ?? 1;

    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.usedSessions + sessions > subscription.totalSessions) {
      throw new BadRequestException('Not enough sessions remaining in subscription');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        usedSessions: {
          increment: sessions,
        },
      },
    });
  }

  async findOne(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }
}
