import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParentDto } from './dto/create-parent.dto';

@Injectable()
export class ParentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateParentDto) {
    const existing = await this.prisma.parent.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Parent email already exists');
    }

    return this.prisma.parent.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.parent.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        students: true,
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    return parent;
  }
}
