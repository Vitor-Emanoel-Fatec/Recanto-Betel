import * as argon2 from 'argon2';
import { UserService } from './user.service.js';
import type { PrismaService } from '../database/prisma.service.js';

describe('UserService credentials and projections', () => {
  const prisma = {
    user: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
  };
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService(prisma as unknown as PrismaService);
  });

  it('hashes newly created passwords and returns only the allowlisted user fields', async () => {
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user-id',
      email: data.email,
      role: data.role,
    }));

    const result = await service.create({
      email: 'parent@example.test',
      password: 'a sufficiently long test password',
      role: 'ADMIN',
    });

    expect(result).toEqual({ id: 'user-id', email: 'parent@example.test', role: 'ADMIN' });
    const [{ data, select }] = prisma.user.create.mock.calls[0];
    expect(await argon2.verify(data.password, 'a sufficiently long test password')).toBe(true);
    expect(select).toEqual({ id: true, email: true, role: true });
  });

  it('forces public signup to USER', async () => {
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user-id',
      email: data.email,
      role: data.role,
    }));
    await expect(service.create({
      email: 'parent@example.test',
      password: 'a sufficiently long test password',
      role: 'ADMIN',
    }, true)).resolves.toMatchObject({ role: 'USER' });
    expect(prisma.user.create.mock.calls[0][0].data.role).toBe('USER');
  });

  it('verifies a legacy plaintext password and conditionally rehashes it', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'legacy-id',
      email: 'legacy@example.test',
      role: 'USER',
      password: 'legacy plaintext password',
    });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.verifyCredentials('legacy@example.test', 'legacy plaintext password'))
      .resolves.toEqual({ id: 'legacy-id', email: 'legacy@example.test', role: 'USER' });

    const [{ where, data }] = prisma.user.updateMany.mock.calls[0];
    expect(where).toEqual({ id: 'legacy-id', password: 'legacy plaintext password' });
    expect(await argon2.verify(data.password, 'legacy plaintext password')).toBe(true);
  });

  it('does not rehash an incorrect legacy password or expose it', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'legacy-id',
      email: 'legacy@example.test',
      role: 'USER',
      password: 'legacy plaintext password',
    });

    await expect(service.verifyCredentials('legacy@example.test', 'wrong password')).resolves.toBeNull();
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('supports hashes created for new credentials', async () => {
    const hash = await argon2.hash('new strong password', { type: argon2.argon2id });
    prisma.user.findUnique.mockResolvedValue({
      id: 'hashed-id',
      email: 'hashed@example.test',
      role: 'USER',
      password: hash,
    });

    await expect(service.verifyCredentials('hashed@example.test', 'new strong password'))
      .resolves.toEqual({ id: 'hashed-id', email: 'hashed@example.test', role: 'USER' });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
});
