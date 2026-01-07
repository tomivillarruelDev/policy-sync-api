import { DeepPartial } from 'typeorm';
import { Address } from '../address/entities/addresses.entity';
import { CreatePersonDto } from '../../dto/create-person.dto';

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
