export const I_PASSWORD_HASHER = 'I_PASSWORD_HASHER';

export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashed: string): Promise<boolean>;
}
