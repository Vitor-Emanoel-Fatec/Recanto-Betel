import { describe, expect, it } from 'vitest';
import { createPublicCode } from './public-codes.js';

describe('createPublicCode', () => {
  it('creates a short, typed public code without exposing internal identifiers', () => {
    const code = createPublicCode('MAT');

    expect(code).toMatch(/^MAT-\d{4}-[A-F0-9]{16}$/);
    expect(code).not.toMatch(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i);
  });

  it('uses the requested entity prefix', () => {
    expect(createPublicCode('BEN')).toMatch(/^BEN-\d{4}-[A-F0-9]{16}$/);
    expect(createPublicCode('RES')).toMatch(/^RES-\d{4}-[A-F0-9]{16}$/);
  });
});
