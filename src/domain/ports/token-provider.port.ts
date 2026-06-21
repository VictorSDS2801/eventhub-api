export const I_TOKEN_PROVIDER = 'I_TOKEN_PROVIDER';

export interface ITokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface ITokenProvider {
  sign(payload: ITokenPayload): string;
  verify(token: string): ITokenPayload;
}
