import { Expose, Type } from 'class-transformer';
import { Address } from '../../../common/address/entities/addresses.entity';
import { Identification } from '../../../common/identification/entity/identification.entity';
import { PhoneNumber } from '../../../common/phone-number/entities/phone-number.entity';
import { Email } from '../../../entities/email.entity';
import { CivilStatus } from '../../../enums/civil-status.enum';
import { Gender } from '../../../enums/gender.enum';

export class ContactDto {
    @Expose()
    id: string;

    // Legal Person Relation (Just exposing the logic connection, or minimal info?)
    // For flat view, maybe we expose the Company Name directly?
    @Expose()
    organizationName?: string; // Derived from legalPerson.organizationName

    // Real Person Fields (The Contact Person)
    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    middleName?: string;

    @Expose()
    maternalLastName?: string;

    @Expose()
    nationality?: string;

    @Expose()
    birthDate?: Date;

    @Expose()
    gender?: Gender;

    @Expose()
    civilStatus?: CivilStatus;

    // Person Fields
    @Expose()
    @Type(() => Email)
    emails: Email[];

    @Expose()
    @Type(() => PhoneNumber)
    phoneNumbers: PhoneNumber[];

    @Expose()
    @Type(() => Address)
    addresses: Address[];

    @Expose()
    @Type(() => Identification)
    identifications: Identification[];
}
