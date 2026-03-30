import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.remove(id);
  }
}
