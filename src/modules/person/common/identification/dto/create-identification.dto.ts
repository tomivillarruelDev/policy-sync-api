import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateIdentificationDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @IsUUID()
  @IsNotEmpty()
  personId: string;
}
