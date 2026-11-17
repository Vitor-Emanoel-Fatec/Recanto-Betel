import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { UserService } from '../user/user.service.js';
import type { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  const user = { id: 'user-id', email: 'parent@example.test', role: 'USER' };
  const users = {
    create: vi.fn(),
    verifyCredentials: vi.fn(),
  };
  const jwt = { signAsync: vi.fn() };
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(users as unknown as UserService, jwt as unknown as JwtService);
  });

  it('creates only USER accounts regardless of signup role input', async () => {
    users.create.mockResolvedValue(user);
    await expect(service.signup({
      email: user.email,
      password: 'a sufficiently long test password',
      role: 'ADMIN',
      termsAccepted: true,
    })).resolves.toEqual(user);
    expect(users.create).toHaveBeenCalledWith(
      { email: user.email, password: 'a sufficiently long test password', role: 'ADMIN', termsAccepted: true },
      true,
    );
  });

  it('rejects signup without explicit terms acceptance', async () => {
    await expect(service.signup({
      email: user.email,
      password: 'a sufficiently long test password',
    })).rejects.toThrow('É necessário aceitar os termos para criar uma conta');
    expect(users.create).not.toHaveBeenCalled();
  });

  it('returns a signed token and safe identity after credential verification', async () => {
    users.verifyCredentials.mockResolvedValue(user);
    jwt.signAsync.mockResolvedValue('signed-test-token');

    await expect(service.signin({
      email: user.email,
      password: 'a sufficiently long test password',
    })).resolves.toEqual({ ...user, accessToken: 'signed-test-token' });
    expect(jwt.signAsync).toHaveBeenCalledWith(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );
  });

  it('uses a generic unauthorized response for invalid credentials', async () => {
    users.verifyCredentials.mockResolvedValue(null);
    await expect(service.signin({ email: user.email, password: 'wrong-password' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
