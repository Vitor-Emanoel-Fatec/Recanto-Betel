import { randomBytes } from 'node:crypto';

export type PublicCodePrefix = 'MAT' | 'BEN' | 'RES';

export function createPublicCode(prefix: PublicCodePrefix): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(8).toString('hex').toUpperCase();
  return `${prefix}-${year}-${suffix}`;
}
