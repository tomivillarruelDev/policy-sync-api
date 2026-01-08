import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Address } from '../../person/common/address/entities/addresses.entity';
import { Identification } from '../../person/common/identification/entity/identification.entity';
import { PhoneNumber } from '../../person/common/phone-number/entities/phone-number.entity';
import { Email } from '../../person/entities/email.entity';

export class InsurerDto {
    @Expose()
    id: string;

    @Expose()
    code: string;

    @Expose()
    executive?: string;

    @Expose()
    agencyNumber?: string;

    @Expose()
    logoUrl?: string;

    // Legal Person Fields
    @Expose()
    organizationName: string;

    @Expose()
    socialReason?: string;

    @Expose()
    website?: string;

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
