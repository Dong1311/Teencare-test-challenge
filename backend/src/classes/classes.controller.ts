import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  async create(@Body() dto: CreateClassDto) {
    const createdClass = await this.classesService.create(dto);
    return {
      message: 'Class created successfully',
      data: createdClass,
    };
  }

  @Get()
  async findAll(@Query('day') day?: string) {
    const classes = await this.classesService.findAll(day);
    return {
      message: 'Classes fetched successfully',
      data: classes,
    };
  }

  @Post(':classId/register')
  async registerStudent(
    @Param('classId', ParseIntPipe) classId: number,
    @Body() dto: RegisterStudentDto,
  ) {
    const result = await this.classesService.registerStudent(classId, dto);
    return {
      message: 'Student registered successfully',
      data: result,
    };
  }
}
