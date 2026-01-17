import { IsDateString, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ToSentenceCase } from '../../../common/transformers/text.transformers';
import { RelationType } from '../enums/relation-type.enum';

export class CreatePolicyDependentDto {
  @IsString()
  @Transform(ToSentenceCase)
  firstName: string;

  @IsString()
  @Transform(ToSentenceCase)
  lastName: string;

  @IsEnum(RelationType)
  relationType: RelationType;

  @IsDateString()
  birthDate: Date;
}
