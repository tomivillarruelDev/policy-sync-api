import { IsEmail, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class CreateRealPersonDto extends CreatePersonDto {
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;
}
