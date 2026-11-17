import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { JwtService } from '@nestjs/jwt';
import type { PrismaService } from '../database/prisma.service.js';

function createContext(headers: Record<string, string> = {}) {
  const request = { headers };
  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as never,
  };
}

describe('JwtAuthGuard', () => {
  const jwt = { verifyAsync: vi.fn() };
  const prisma = { user: { findUnique: vi.fn() } };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new JwtAuthGuard(
      jwt as unknown as JwtService,
      prisma as unknown as PrismaService,
    );
  });

  it('rejects missing and invalid tokens', async () => {
    const missing = createContext();
    await expect(guard.canActivate(missing.context)).rejects.toBeInstanceOf(UnauthorizedException);

    jwt.verifyAsync.mockRejectedValue(new Error('invalid signature'));
    const invalid = createContext({ authorization: 'Bearer invalid' });
    await expect(guard.canActivate(invalid.context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('accepts a signed HttpOnly-cookie token only for a current database identity', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'account-id', email: 'admin@example.test' });
    prisma.user.findUnique.mockResolvedValue({
      id: 'account-id',
      email: 'admin@example.test',
      role: 'ADMIN',
    });
    const { context, request } = createContext({ cookie: 'other=x; recanto_access=signed-token' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toMatchObject({
      user: { id: 'account-id', email: 'admin@example.test', role: 'ADMIN' },
    });
  });

  it('rejects a validly signed token for a deleted account', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'deleted-id', email: 'old@example.test' });
    prisma.user.findUnique.mockResolvedValue(null);
    const { context } = createContext({ authorization: 'Bearer signed-token' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('does not mask database failures as authentication failures', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'account-id', email: 'user@example.test' });
    prisma.user.findUnique.mockRejectedValue(new Error('database unavailable'));
    const { context } = createContext({ authorization: 'Bearer signed-token' });

    await expect(guard.canActivate(context)).rejects.toThrow('database unavailable');
  });
});
