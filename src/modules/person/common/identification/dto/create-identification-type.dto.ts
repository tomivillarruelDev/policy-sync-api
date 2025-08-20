import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIdentificationTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
