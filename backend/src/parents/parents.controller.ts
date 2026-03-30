import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  async create(@Body() dto: CreateParentDto) {
    const parent = await this.parentsService.create(dto);
    return {
      message: 'Parent created successfully',
      data: parent,
    };
  }

  @Get()
  async findAll() {
    const parents = await this.parentsService.findAll();
    return {
      message: 'Parents fetched successfully',
      data: parents,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const parent = await this.parentsService.findOne(id);
    return {
      message: 'Parent fetched successfully',
      data: parent,
    };
  }
}
