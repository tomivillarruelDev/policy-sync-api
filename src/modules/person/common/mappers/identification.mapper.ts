import { DeepPartial } from 'typeorm';
import { Identification } from '../identification/entity/identification.entity';
import { CreatePersonDto } from '../../dto/create-person.dto';

export function mapIdentificationDto(
  dto: InstanceType<typeof CreatePersonDto.IdentificationForPerson>[],
): DeepPartial<Identification>[] {
  return dto.map((i) => ({
    value: i.value,
    type: { id: i.typeId }, //relación FK
  }));
}