import { DayOfWeek } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @Transform(({ value }) => String(value).toUpperCase())
  @IsEnum(DayOfWeek, {
    message: 'dayOfWeek must be MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, or SUNDAY',
  })
  dayOfWeek!: DayOfWeek;

  @IsString()
  @Matches(/^\d{2}:\d{2}-\d{2}:\d{2}$/, {
    message: 'timeSlot must be in HH:mm-HH:mm format',
  })
  timeSlot!: string;

  @IsString()
  @IsNotEmpty()
  teacherName!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  maxStudents!: number;
}
