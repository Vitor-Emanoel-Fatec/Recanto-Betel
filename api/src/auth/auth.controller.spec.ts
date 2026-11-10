import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import type { Response } from 'express';

describe('AuthController', () => {
  it('sets the JWT in an HttpOnly cookie and never returns it in the response body', async () => {
    const authService = {
      signin: vi.fn().mockResolvedValue({
        id: 'user-id',
        email: 'parent@example.test',
        role: 'PARENT',
        accessToken: 'signed-test-token',
      }),
    };
    const controller = new AuthController(authService as AuthService);
    const response = { cookie: vi.fn() } as unknown as Response;

    await expect(controller.signin(
      { email: 'parent@example.test', password: 'a sufficiently long test password' },
      response,
    )).resolves.toEqual({
      id: 'user-id',
      email: 'parent@example.test',
      role: 'PARENT',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'recanto_access',
      'signed-test-token',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
    );
  });

  it('exposes signup, signin, current-user and signout handlers', () => {
    expect(AuthController.prototype.signup).toBeTypeOf('function');
    expect(AuthController.prototype.signin).toBeTypeOf('function');
    expect(AuthController.prototype.me).toBeTypeOf('function');
    expect(AuthController.prototype.signout).toBeTypeOf('function');
  });
});
