import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { I_TOKEN_PROVIDER } from '../../../domain/ports/token-provider.port';
import type { ITokenProvider } from '../../../domain/ports/token-provider.port';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(I_TOKEN_PROVIDER)
    private readonly tokenProvider: ITokenProvider,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido.');
    }

    try {
      const payload = this.tokenProvider.verify(token);
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
