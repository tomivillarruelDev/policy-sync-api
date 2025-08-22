import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export function handleDBErrors(error: any): never {
  // 23505: unique_violation, 23503: foreign_key_violation
  if (error?.code === '23505') {
    throw new ConflictException('Registro duplicado');
  }
  if (error?.code === '23503') {
    throw new BadRequestException('Violación de clave foránea');
  }
  throw new InternalServerErrorException('Unexpected database error');
}
