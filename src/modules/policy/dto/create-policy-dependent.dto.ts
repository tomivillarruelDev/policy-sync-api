import { IsDateString, IsEnum, IsString } from 'class-validator';
import { RelationType } from '../enums/relation-type.enum';

export class CreatePolicyDependentDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEnum(RelationType)
    relationType: RelationType;

    @IsDateString()
    birthDate: Date;
}
