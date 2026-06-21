import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../../../domain/entities/user/role.vo';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
