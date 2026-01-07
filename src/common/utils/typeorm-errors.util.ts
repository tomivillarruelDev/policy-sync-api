import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

export function handleDBErrors(error: any): never {
  // Si ya es una HttpException lanzada por la app, re-lanzar tal cual
  if (error instanceof HttpException) {
    throw error;
  }

  // Algunos errores de TypeORM vienen como QueryFailedError con info en driverError
  const pgErr = error?.driverError ?? error;
  const rawCode: any = pgErr?.code;
  const code: string | undefined =
    typeof rawCode === 'number' ? String(rawCode) : rawCode;
  const detail: string | undefined = pgErr?.detail;
  let constraint: string | undefined = pgErr?.constraint;
  const message: string | undefined = pgErr?.message ?? error?.message;
  const composed = `${message ?? ''} ${detail ?? ''}`.trim();

  // 23505: unique_violation
  //todo: los errores deberian avisar el tipo de persona y el campo que falla exactamente
  if (
    code === '23505' ||
    /duplicate key value/i.test(composed) ||
    /violates unique constraint/i.test(composed) ||
    /llave duplicada/i.test(composed) ||
    /violaci[óo]n de restricci[óo]n [úu]nica/i.test(composed) ||
    /ya existe/i.test(composed)
  ) {
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

    // Si no vino constraint, intentar extraerlo del message (inglés/español)
    if (!constraint && composed) {
      const c1 = composed.match(/constraint\s+"([^"]+)"/i);
      const c2 = composed.match(/restricci[óo]n\s+[úu]nica\s+"([^"]+)"/i);
      constraint = c1?.[1] ?? c2?.[1] ?? constraint;
      response.constraint = constraint;
    }

    // Si hay mensaje específico por constraint, úsalo
    if (constraint && constraintMessages[constraint]) {
      response.message = constraintMessages[constraint];
      throw new ConflictException(response);
    }

    // Parse genérico del detail (variantes EN/ES)
    const match = (detail ?? composed).match(
      /Key \((.+)\)=\((.+)\) (?:already exists\.?|ya existe\.?)/i,
    );
    if (match) {
      const keys = match[1].split(',').map((s) => s.trim());
      const vals = match[2].split(',').map((s) => s.trim());
      const fields = keys.reduce<Record<string, string>>((acc, k, i) => {
        acc[k] = vals[i] ?? '';
        return acc;
      }, {});
  //todo: los errores deberian avisar el tipo de persona y el campo que falla exactamente
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
  //todo: los errores deberian avisar el tipo de persona y el campo que falla exactamente
  // 23503: foreign_key_violation
  if (code === '23503' || /foreign key/i.test(composed)) {
    // Ejemplo de detail: "Key (person_id)=(...) is not present in table \"people\"."
    let response: any = {
      message: 'Violación de clave foránea',
      code: '23503',
    };
    const match = (detail ?? composed).match(
      /Key \((.+)\)=\((.+)\) (?:is not present in table|no est[áa] presente en la tabla)/i,
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

  // TypeORM: intento de UPDATE sin valores
  if (
    error?.name === 'UpdateValuesMissingError' ||
    /update values are not defined/i.test(message ?? '')
  ) {
    throw new BadRequestException({
      message:
        'No hay valores para actualizar. Verifica que no estés enviando objetos vacíos o solo con id en una operación de actualización.',
      error: 'UpdateValuesMissingError',
    });
  }

  // Log diagnóstico para entender el formato real cuando no mapeamos el error
  try {
    // Evitar serializar objetos enormes/cíclicos
    const diag = {
      name: error?.name,
      code: error?.driverError?.code ?? error?.code,
      message: error?.driverError?.message ?? error?.message,
      detail: error?.driverError?.detail ?? error?.detail,
      constraint: error?.driverError?.constraint ?? error?.constraint,
      table: error?.driverError?.table ?? error?.table,
      schema: error?.driverError?.schema ?? error?.schema,
    };
    // eslint-disable-next-line no-console
    console.error('[DB ERROR UNMAPPED]', diag);
  } catch {}
  throw new InternalServerErrorException('Unexpected database error');
}
