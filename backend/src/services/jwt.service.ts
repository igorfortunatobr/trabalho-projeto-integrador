import { createHmac } from 'node:crypto';

export type AuthTokenPayload = {
  sub: string;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  iat: number;
  exp: number;
};

export class InvalidTokenError extends Error {}

export function generateToken(
  payload: Omit<AuthTokenPayload, 'iat' | 'exp'>,
  secret: string,
  expiresInSeconds = 60 * 60,
) {
  const now = Math.floor(Date.now() / 1000);

  return signJwt(
    {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    },
    secret,
  );
}

export function verifyToken(token: string, secret: string) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new InvalidTokenError('Invalid token.');
  }

  const [encodedHeader, encodedPayload, signature] = parts as [
    string,
    string,
    string,
  ];
  const expectedSignature = createSignature(
    `${encodedHeader}.${encodedPayload}`,
    secret,
  );

  if (signature !== expectedSignature) {
    throw new InvalidTokenError('Invalid token.');
  }

  const payload = JSON.parse(
    decodeBase64Url(encodedPayload),
  ) as AuthTokenPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new InvalidTokenError('Token expired.');
  }

  return payload;
}

function signJwt(payload: AuthTokenPayload, secret: string) {
  const encodedHeader = encodeBase64Url(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  );
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = createSignature(
    `${encodedHeader}.${encodedPayload}`,
    secret,
  );

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function createSignature(content: string, secret: string) {
  return createHmac('sha256', secret).update(content).digest('base64url');
}

function encodeBase64Url(content: string) {
  return Buffer.from(content).toString('base64url');
}

function decodeBase64Url(content: string) {
  return Buffer.from(content, 'base64url').toString('utf-8');
}
