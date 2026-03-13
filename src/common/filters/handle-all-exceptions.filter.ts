/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as any).message || 'Internal server error' };

    // Si es un objeto, lo enviamos de forma transparente
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      return response.status(status).json({
        statusCode: status,
        ...exceptionResponse,
      });
    }

    // Fallback para mensajes de error que son solo un string
    return response.status(status).json({
      statusCode: status,
      message: exceptionResponse,
    });
  }
}
