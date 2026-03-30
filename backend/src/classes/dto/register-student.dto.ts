import { Transform } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class RegisterStudentDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsDateString()
  classDate!: string;
}
