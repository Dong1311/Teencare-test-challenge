import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  dob!: string;

  @Transform(({ value }) => String(value).toUpperCase())
  @IsEnum(Gender, {
    message: 'gender must be MALE, FEMALE, or OTHER',
  })
  gender!: Gender;

  @IsString()
  @IsNotEmpty()
  currentGrade!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  parentId!: number;
}
