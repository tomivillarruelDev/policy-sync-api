import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, IsString } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 1,
    required: false,
    description: 'Page number (1-based)',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    default: 10,
    required: false,
    description: 'Number of items per page',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'Search term to filter results',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
