import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${hashedPassword}`;
}

export function verifyPassword(password: string, storedPasswordHash: string) {
  const [salt, expectedHash] = storedPasswordHash.split(':');

  if (!salt || !expectedHash) {
    return false;
  }

  const currentHash = scryptSync(password, salt, 64).toString('hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const currentBuffer = Buffer.from(currentHash, 'hex');

  if (expectedBuffer.length !== currentBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, currentBuffer);
}
