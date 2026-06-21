import { IAuthResult } from '../../domain/services/auth.service';

export class AuthResponseDto {
  accessToken!: string;
  user!: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  static fromResult(result: IAuthResult): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.accessToken = result.accessToken;
    dto.user = {
      id: result.user.id,
      name: result.user.getName(),
      email: result.user.getEmail().getValue(),
      role: result.user.getRole().getValue(),
    };
    return dto;
  }
}
