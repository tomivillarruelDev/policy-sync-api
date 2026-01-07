// import { NotFoundException } from "@nestjs/common";
// import { LegalPerson } from "../../entities/legal-person.entity";
// import { UpdateContactDto } from "../../roles/contact/dto/update-contact.dto";
// import { mapPersonData, updateLegalPerson } from "../mappers";

// export async function handleLegalPersonUpdate(
//     current: LegalPerson | null,
//     dto: UpdateContactDto,
// ): Promise<LegalPerson | null> {
//     const legalRepo = this.dataSource.getRepository(LegalPerson);

//     if (dto.legalPersonId !== undefined) {
//         if (dto.legalPersonId === null) return null;
//         if (!current || dto.legalPersonId !== current.id) {
//             const newLegal = await legalRepo.findOneBy({ id: dto.legalPersonId });
//             if (!newLegal) throw new NotFoundException('LegalPerson no encontrada');
//             return newLegal;
//         }
//     } else if (dto.legalPerson) {
//         if (current) {
//             updateLegalPerson(legalRepo, current, dto.legalPerson);
//         } else {
//             return legalRepo.create({
//                 ...dto.legalPerson,
//                 person: { type: 'LEGAL', ...mapPersonData(dto.legalPerson) },
//             });
//         }
//     }

//     return current;
// }