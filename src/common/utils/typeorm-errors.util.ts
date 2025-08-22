import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export function handleDBErrors(error: any): never {
  // 23505: unique_violation, 23503: foreign_key_violation
  if (error?.code === '23505') {
    // Intentar parsear detalle de Postgres: "Key (field)=(value) already exists."
    const detail: string | undefined = error?.detail;
    const constraint: string | undefined = error?.constraint;

    // Mensajes por constraint conocidos
    const constraintMessages: Record<string, string> = {
      UQ_ident_person_type_number:
        'La combinación de persona + tipo + número de identificación ya existe.',
      UQ_ident_person_type_value:
        'La combinación de persona + tipo + identificación ya existe.',
      UQ_ident_type_value: 'El tipo de identificación con ese valor ya existe.',
    };

    let response: any = {
      message: 'Registro duplicado',
      code: '23505',
      constraint,
    };

    // Si hay mensaje específico por constraint, úsalo
    if (constraint && constraintMessages[constraint]) {
      response.message = constraintMessages[constraint];
      throw new ConflictException(response);
    }

    // Parse genérico del detail
    const match = detail?.match(/Key \((.+)\)=\((.+)\) already exists\./);
    if (match) {
      const keys = match[1].split(',').map((s) => s.trim());
      const vals = match[2].split(',').map((s) => s.trim());
      const fields = keys.reduce<Record<string, string>>((acc, k, i) => {
        acc[k] = vals[i] ?? '';
        return acc;
      }, {});

      response = {
        ...response,
        message:
          keys.length > 1
            ? `Valores duplicados en los campos: ${keys.join(', ')}`
            : `Valor duplicado en el campo '${keys[0]}'`,
        fields,
      };
    }

    throw new ConflictException(response);
  }
  if (error?.code === '23503') {
    // Ejemplo de detail: "Key (person_id)=(...) is not present in table \"people\"."
    const detail: string | undefined = error?.detail;
    let response: any = {
      message: 'Violación de clave foránea',
      code: '23503',
    };
    const match = detail?.match(
      /Key \((.+)\)=\((.+)\) is not present in table/,
    );
    if (match) {
      response = {
        ...response,
        message: `Referencia inválida en el campo '${match[1]}'`,
        field: match[1],
        value: match[2],
      };
    }
    throw new BadRequestException(response);
  }
  throw new InternalServerErrorException('Unexpected database error');
}
