import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ParentsModule } from './parents/parents.module';
import { StudentsModule } from './students/students.module';
import { ClassesModule } from './classes/classes.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { RegistrationsModule } from './registrations/registrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ParentsModule,
    StudentsModule,
    ClassesModule,
    SubscriptionsModule,
    RegistrationsModule,
  ],
})
export class AppModule {}
