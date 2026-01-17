import { Transform } from 'class-transformer';
import { ToLowerCase } from '../../../common/transformers/text.transformers';
import { IsEmail, IsNotEmpty, IsUUID, Matches } from 'class-validator';

export class CreateEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(ToLowerCase)
  @Matches(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, {
    message: 'The email must be a valid email address',
  })
  account: string;

  @IsUUID()
  @IsNotEmpty()
  personId: string;
}
