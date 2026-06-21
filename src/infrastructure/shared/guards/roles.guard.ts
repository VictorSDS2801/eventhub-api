import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { RoleEnum } from '../../../domain/entities/user/role.vo';
import { ITokenPayload } from '../../../domain/ports/token-provider.port';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // rota sem restrição de papel
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as ITokenPayload | undefined;

    if (!user || !requiredRoles.includes(user.role as RoleEnum)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso.',
      );
    }

    return true;
  }
}
