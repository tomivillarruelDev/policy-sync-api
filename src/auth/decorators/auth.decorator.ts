import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from '../interfaces/valid-roles.enum';
import { UserRoleGuard } from '../guards/role-guard/role-guard.guard';
import { RoleProtected } from './role-protected.decorator';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
