import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBusinessDto {
  @IsUUID()
  @IsNotEmpty()
  legalPersonId: string;
}
