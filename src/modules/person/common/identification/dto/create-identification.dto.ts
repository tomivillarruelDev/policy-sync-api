import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateIdentificationDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @IsUUID()
  @IsNotEmpty()
  personId: string;
}
