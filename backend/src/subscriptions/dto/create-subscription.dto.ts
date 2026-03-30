import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSubscriptionDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsString()
  @IsNotEmpty()
  packageName!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  totalSessions!: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  usedSessions?: number;
}
