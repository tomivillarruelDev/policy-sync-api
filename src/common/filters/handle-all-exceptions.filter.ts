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

    // Manejo específico para errores de validación (BadRequestException)
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      const errorMessage =
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? Array.isArray(exceptionResponse['message'])
            ? exceptionResponse['message']
            : [exceptionResponse['message']]
          : ['Solicitud incorrecta'];

      return response.status(status).json({
        statusCode: status,
        message: errorMessage,
        error: 'Bad Request',
      });
    }

    // Manejo para otros tipos de errores
    response.status(status).json({
      statusCode: status,
      message:
        status !== HttpStatus.INTERNAL_SERVER_ERROR
          ? (exception as any).message
          : 'Internal server error',
    });
  }
}
