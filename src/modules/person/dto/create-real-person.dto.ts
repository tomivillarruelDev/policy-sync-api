import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class CreateRealPersonDto extends CreatePersonDto{
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  dni?: string;
}
