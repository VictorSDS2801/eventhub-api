import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../entities/user/user';
import { Email } from '../../entities/user/email.vo';
import { Role, RoleEnum } from '../../entities/user/role.vo';
import { I_USER_REPOSITORY } from '../../repositories/user.repository.interface';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { I_PASSWORD_HASHER } from '../../ports/password-hasher.port';
import type { IPasswordHasher } from '../../ports/password-hasher.port';
import { I_TOKEN_PROVIDER } from '../../ports/token-provider.port';
import type { ITokenProvider } from '../../ports/token-provider.port';
import { InvalidCredentialsException } from '../../exceptions/auth/invalid-credentials.exception';
import { EmailAlreadyInUseException } from '../../exceptions/auth/email-already-in-use.exception';

export interface IRegisterParams {
  name: string;
  email: string;
  password: string;
  role?: RoleEnum;
}

export interface ILoginParams {
  email: string;
  password: string;
}

export interface IAuthResult {
  user: User;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(I_USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(I_PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(I_TOKEN_PROVIDER)
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async register(params: IRegisterParams): Promise<IAuthResult> {
    const email = Email.create(params.email);

    const existing = await this.userRepository.findByEmail(email.getValue());
    if (existing) {
      throw new EmailAlreadyInUseException(email.getValue());
    }

    const passwordHash = await this.passwordHasher.hash(params.password);

    const user = User.create({
      name: params.name,
      email,
      passwordHash,
      role: params.role ? Role.fromValue(params.role) : Role.participant(),
    });

    const savedUser = await this.userRepository.save(user);

    const accessToken = this.tokenProvider.sign({
      sub: savedUser.id,
      email: savedUser.getEmail().getValue(),
      role: savedUser.getRole().getValue(),
    });

    return { user: savedUser, accessToken };
  }

  async login(params: ILoginParams): Promise<IAuthResult> {
    const user = await this.userRepository.findByEmail(
      params.email.toLowerCase(),
    );
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      params.password,
      user.getPasswordHash(),
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const accessToken = this.tokenProvider.sign({
      sub: user.id,
      email: user.getEmail().getValue(),
      role: user.getRole().getValue(),
    });

    return { user, accessToken };
  }
}
