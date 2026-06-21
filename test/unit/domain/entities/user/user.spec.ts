import { User } from '../../../../../src/domain/entities/user/user';
import { Email } from '../../../../../src/domain/entities/user/email.vo';
import { Role } from '../../../../../src/domain/entities/user/role.vo';

describe('User', () => {
  const buildValidUser = () =>
    User.create({
      name: 'Victor Silva',
      email: Email.create('victor@example.com'),
      passwordHash: 'hashed-password-123',
      role: Role.participant(),
    });

  it('deve criar um usuário válido', () => {
    const user = buildValidUser();

    expect(user.id).toBeDefined();
    expect(user.getName()).toBe('Victor Silva');
    expect(user.getEmail().getValue()).toBe('victor@example.com');
    expect(user.getRole().getValue()).toBe('PARTICIPANT');
  });

  it('deve lançar erro se o nome estiver vazio', () => {
    expect(() =>
      User.create({
        name: '   ',
        email: Email.create('victor@example.com'),
        passwordHash: 'hashed-password-123',
        role: Role.participant(),
      }),
    ).toThrow('O nome do usuário não pode estar vazio.');
  });

  it('deve remover espaços extras do nome (trim)', () => {
    const user = User.create({
      name: '  Victor Silva  ',
      email: Email.create('victor@example.com'),
      passwordHash: 'hashed-password-123',
      role: Role.participant(),
    });

    expect(user.getName()).toBe('Victor Silva');
  });
});
