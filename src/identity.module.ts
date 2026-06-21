import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthController } from './application/controllers/auth.controller';
import { AuthService } from './domain/services/auth.service';
import { I_PASSWORD_HASHER } from './domain/ports/password-hasher.port';
import { I_TOKEN_PROVIDER } from './domain/ports/token-provider.port';
import { BcryptPasswordHasherAdapter } from './infrastructure/adapters/bcrypt-password-hasher.adapter';
import { JwtTokenProviderAdapter } from './infrastructure/adapters/jwt-token-provider.adapter';
import { JwtAuthGuard } from './infrastructure/shared/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/shared/guards/roles.guard';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET não está definido nas variáveis de ambiente.',
          );
        }
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') ??
          '1d') as `${number}${'s' | 'm' | 'h' | 'd'}`;

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: I_PASSWORD_HASHER, useClass: BcryptPasswordHasherAdapter },
    { provide: I_TOKEN_PROVIDER, useClass: JwtTokenProviderAdapter },
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [I_TOKEN_PROVIDER, JwtAuthGuard, RolesGuard],
})
export class IdentityModule {}
