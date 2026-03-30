import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async remove(id: number) {
    const registration = await this.prisma.classRegistration.findUnique({
      where: { id },
      include: {
        class: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const classStartTime = this.buildClassStartDateTime(
      registration.classDate,
      registration.class.timeSlot,
    );

    const now = new Date();
    const isMoreThan24HoursBeforeClass =
      classStartTime.getTime() - now.getTime() > 24 * 60 * 60 * 1000;

    const refunded = await this.prisma.$transaction(async (tx) => {
      await tx.classRegistration.delete({
        where: { id },
      });

      if (!isMoreThan24HoursBeforeClass || !registration.subscriptionIdUsed) {
        return false;
      }

      const subscription = await tx.subscription.findUnique({
        where: { id: registration.subscriptionIdUsed },
      });

      if (!subscription || subscription.usedSessions <= 0) {
        return false;
      }

      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          usedSessions: {
            decrement: 1,
          },
        },
      });

      return true;
    });

    if (isMoreThan24HoursBeforeClass && refunded) {
      return {
        message:
          'Cancellation before 24 hours: registration removed, 1 session refunded',
        data: {
          registrationId: id,
          refundedSessions: 1,
        },
      };
    }

    if (isMoreThan24HoursBeforeClass && !refunded) {
      return {
        message:
          'Cancellation before 24 hours: registration removed, no refundable session found',
        data: {
          registrationId: id,
          refundedSessions: 0,
        },
      };
    }

    return {
      message: 'Cancellation within 24 hours: registration removed, no refund',
      data: {
        registrationId: id,
        refundedSessions: 0,
      },
    };
  }

  private buildClassStartDateTime(classDate: Date, timeSlot: string): Date {
    const match = timeSlot.match(/^(\d{2}):(\d{2})-\d{2}:\d{2}$/);
    if (!match) {
      throw new BadRequestException('Invalid class timeSlot format');
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    const classStart = new Date(classDate);
    classStart.setUTCHours(hour, minute, 0, 0);

    return classStart;
  }
}
