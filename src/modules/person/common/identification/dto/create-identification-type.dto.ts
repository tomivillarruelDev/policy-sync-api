import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateIdentificationTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  nameEs?: string;
}
