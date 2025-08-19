import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../entities/user.entity';

// Extend Express Request interface to include user property
declare module 'express' {
  interface Request {
    user?: User;
  }
}

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user)
      throw new InternalServerErrorException('User not found in request');

    return !data ? user : data in user ? user[data as keyof User] : undefined;
  },
);
