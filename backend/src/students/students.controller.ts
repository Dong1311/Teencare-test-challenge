import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  async create(@Body() dto: CreateStudentDto) {
    const student = await this.studentsService.create(dto);
    return {
      message: 'Student created successfully',
      data: student,
    };
  }

  @Get()
  async findAll() {
    const students = await this.studentsService.findAll();
    return {
      message: 'Students fetched successfully',
      data: students,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const student = await this.studentsService.findOne(id);
    return {
      message: 'Student fetched successfully',
      data: student,
    };
  }
}
