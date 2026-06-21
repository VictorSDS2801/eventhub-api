import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  I_USER_REPOSITORY,
  IUserRepository,
} from '../repositories/user.repository.interface';
import {
  I_PASSWORD_HASHER,
  IPasswordHasher,
} from '../ports/password-hasher.port';
import { I_TOKEN_PROVIDER, ITokenProvider } from '../ports/token-provider.port';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { User } from '../entities/user';
import { Email } from '../entities/email.vo';
import { Role } from '../entities/role.vo';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenProvider: jest.Mocked<ITokenProvider>;

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<IUserRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    const mockPasswordHasher: jest.Mocked<IPasswordHasher> = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    const mockTokenProvider: jest.Mocked<ITokenProvider> = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: I_USER_REPOSITORY, useValue: mockUserRepository },
        { provide: I_PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: I_TOKEN_PROVIDER, useValue: mockTokenProvider },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(I_USER_REPOSITORY);
    passwordHasher = module.get(I_PASSWORD_HASHER);
    tokenProvider = module.get(I_TOKEN_PROVIDER);
  });

  describe('register', () => {
    it('deve registrar um novo usuário e retornar token', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue('hashed-password');
      userRepository.save.mockImplementation((user) => Promise.resolve(user));
      tokenProvider.sign.mockReturnValue('fake-jwt-token');

      const result = await service.register({
        name: 'Victor Silva',
        email: 'victor@example.com',
        password: 'senha123',
      });

      expect(result.accessToken).toBe('fake-jwt-token');
      expect(result.user.getEmail().getValue()).toBe('victor@example.com');
      expect(passwordHasher.hash).toHaveBeenCalledWith('senha123');
    });

    it('deve lançar erro se o e-mail já estiver em uso', async () => {
      const existingUser = User.create({
        name: 'Outro usuário',
        email: Email.create('victor@example.com'),
        passwordHash: 'hash',
        role: Role.participant(),
      });
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.register({
          name: 'Victor Silva',
          email: 'victor@example.com',
          password: 'senha123',
        }),
      ).rejects.toThrow(EmailAlreadyInUseException);
    });
  });

  describe('login', () => {
    it('deve autenticar um usuário com credenciais válidas', async () => {
      const existingUser = User.create({
        name: 'Victor Silva',
        email: Email.create('victor@example.com'),
        passwordHash: 'hashed-password',
        role: Role.participant(),
      });
      userRepository.findByEmail.mockResolvedValue(existingUser);
      passwordHasher.compare.mockResolvedValue(true);
      tokenProvider.sign.mockReturnValue('fake-jwt-token');

      const result = await service.login({
        email: 'victor@example.com',
        password: 'senha123',
      });

      expect(result.accessToken).toBe('fake-jwt-token');
    });

    it('deve lançar erro se o usuário não existir', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@example.com', password: 'senha123' }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('deve lançar erro se a senha estiver incorreta', async () => {
      const existingUser = User.create({
        name: 'Victor Silva',
        email: Email.create('victor@example.com'),
        passwordHash: 'hashed-password',
        role: Role.participant(),
      });
      userRepository.findByEmail.mockResolvedValue(existingUser);
      passwordHasher.compare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'victor@example.com',
          password: 'senha-errada',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });
});
