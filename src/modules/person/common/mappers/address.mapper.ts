import { DeepPartial } from 'typeorm';
import { Address } from '../address/entities/addresses.entity';
import { CreatePersonDto } from '../../dto/create-person.dto';
import { Expose } from 'class-transformer';

export function mapAddressDto(
  dto: InstanceType<typeof CreatePersonDto.AddressForPerson>[] | undefined,
): DeepPartial<Address>[] | undefined {
  if (!dto || !Array.isArray(dto)) return undefined;

  return dto.map((a) => ({
    street: a.street,
    streetNumber: a.streetNumber,
    zipCode: a.zipCode,
    apartment: a.apartment,
    city: { id: a.cityId }, // relación FK
  }));
}

export class AddressResponseDto {
  @Expose()
  id: string;

  @Expose()
  street: string;

  @Expose()
  streetNumber: string;

  @Expose()
  apartment: string;

  @Expose()
  zipCode: string;

  @Expose()
  cityId: string;

  @Expose()
  stateId: string;

  @Expose()
  countryId: string;

  @Expose()
  city?: any;
}

export function mapAddressToResponseDto(address: Address) {
  if (!address) return undefined;
  return {
    ...address,
    cityId: address.city?.id,
    stateId: address.city?.state?.id,
    countryId: address.city?.state?.country?.id,
  };
}
