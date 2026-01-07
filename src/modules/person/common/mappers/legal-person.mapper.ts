// import { UpdateLegalPersonDto } from '../../dto/update-legal-person.dto';
// import { LegalPerson } from '../../entities/legal-person.entity';
// import { mapPersonData } from './person.mapper';

// import { Repository } from 'typeorm';

// export function updateLegalPerson(
//   repo: Repository<LegalPerson>,
//   entity: LegalPerson,
//   dto: UpdateLegalPersonDto,
// ): LegalPerson {
//   repo.merge(entity, {
//     ...mapPersonData(dto),
//     organizationName: dto.organizationName ?? entity.organizationName,
//     socialReason: dto.socialReason ?? entity.socialReason,
//     website: dto.website ?? entity.website,
//   });
//   return entity;
// }
