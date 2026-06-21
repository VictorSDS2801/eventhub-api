import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../domain/services/auth.service';
import { RoleEnum } from '../../domain/entities/role.vo';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const result = await this.authService.register({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role as RoleEnum | undefined,
    });
    return AuthResponseDto.fromResult(result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    return AuthResponseDto.fromResult(result);
  }
}
