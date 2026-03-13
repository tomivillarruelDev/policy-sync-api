import { EntityManager, In, Not } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { Email } from '../../entities/email.entity';
import { Identification } from '../identification/entity/identification.entity';
import { IdentificationType } from '../identification/entity/identification-type.entity';

export async function validatePersonUniqueConstraints(
    manager: EntityManager,
    personId: string,
    dto: {
        emails?: { account: string }[];
        identifications?: { value: string; typeId: string }[];
    },
) {
    // 1. Validar Emails
    if (dto.emails && dto.emails.length > 0) {
        const incomingAccounts = dto.emails
            .map((e) => e.account?.trim())
            .filter((e) => !!e);

        if (incomingAccounts.length > 0) {
            const existingEmails = await manager.getRepository(Email).find({
                where: {
                    account: In(incomingAccounts),
                    person: { id: Not(personId) },
                },
                relations: ['person'],
            });

            if (existingEmails.length > 0) {
                const conflict = existingEmails[0];
                throw new ConflictException({
                    message: `El correo '${conflict.account}' ya está asociado a otra persona.`,
                    targetField: 'account',
                });
            }
        }
    }

    // 2. Validar Identificaciones
    if (dto.identifications && dto.identifications.length > 0) {
        for (const ident of dto.identifications) {
            if (!ident.value || !ident.typeId) continue;

            const count = await manager.getRepository(Identification).count({
                where: {
                    value: ident.value.trim(),
                    type: { id: ident.typeId },
                    person: { id: Not(personId) },
                },
            });

            if (count > 0) {
                throw new ConflictException({
                    message: `La identificación '${ident.value}' ya está en uso por otra persona.`,
                    targetField: 'identificationValue',
                });
            }
        }
    }
}
