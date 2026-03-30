import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: dto.parentId },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    return this.prisma.student.create({
      data: {
        name: dto.name,
        dob: new Date(dto.dob),
        gender: dto.gender,
        currentGrade: dto.currentGrade,
        parentId: dto.parentId,
      },
    });
  }

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        parent: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        parent: true,
        subscriptions: {
          orderBy: { endDate: 'asc' },
        },
        registrations: {
          include: {
            class: true,
          },
          orderBy: { classDate: 'asc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }
}
