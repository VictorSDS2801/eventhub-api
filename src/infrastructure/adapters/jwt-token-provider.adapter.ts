import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  ITokenProvider,
  ITokenPayload,
} from '../../domain/ports/token-provider.port';

@Injectable()
export class JwtTokenProviderAdapter implements ITokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: ITokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): ITokenPayload {
    return this.jwtService.verify<ITokenPayload>(token);
  }
}
