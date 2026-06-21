import { Email, InvalidEmailException } from '../../../../../src/domain/entities/user/email.vo';

describe('Email', () => {
  it('deve criar um e-mail válido', () => {
    const email = Email.create('victor@example.com');
    expect(email.getValue()).toBe('victor@example.com');
  });

  it('deve normalizar para minúsculas', () => {
    const email = Email.create('Victor@EXAMPLE.com');
    expect(email.getValue()).toBe('victor@example.com');
  });

  it('deve remover espaços em branco', () => {
    const email = Email.create('  victor@example.com  ');
    expect(email.getValue()).toBe('victor@example.com');
  });

  it('deve lançar erro para e-mail sem @', () => {
    expect(() => Email.create('victorexample.com')).toThrow(InvalidEmailException);
  });

  it('deve lançar erro para e-mail sem domínio', () => {
    expect(() => Email.create('victor@')).toThrow(InvalidEmailException);
  });
});
