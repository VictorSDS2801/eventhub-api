import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/ports/password-hasher.port';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordHasherAdapter implements IPasswordHasher {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
