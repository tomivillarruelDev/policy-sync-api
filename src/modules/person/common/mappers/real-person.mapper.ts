// import { UpdateRealPersonDto } from '../../dto/update-real-person.dto';
// import { RealPerson } from '../../entities/real-person.entity';
// import { mapPersonData } from './person.mapper';
// import { Repository } from 'typeorm';

// export function updateRealPerson(
//   repo: Repository<RealPerson>,
//   entity: RealPerson,
//   dto: UpdateRealPersonDto,
// ): RealPerson {
//   repo.merge(entity, {
//     ...mapPersonData(dto),
//     firstName: dto.firstName ?? entity.firstName,
//     lastName: dto.lastName ?? entity.lastName,
//   });
//   return entity;
// }
