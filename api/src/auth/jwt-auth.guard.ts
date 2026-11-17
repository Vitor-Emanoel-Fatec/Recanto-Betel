import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service.js';
import type { AuthenticatedRequest, UserRole } from './authenticated-user.js';

function tokenFromRequest(request: AuthenticatedRequest): string | undefined {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7);

  const cookie = request.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('recanto_access='));

  return cookie?.slice('recanto_access='.length);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = tokenFromRequest(request);
    if (!token) throw new UnauthorizedException('Autenticação necessária');

    let payload: { sub: string; email: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    if (!payload.sub || !payload.email) throw new UnauthorizedException('Token inválido ou expirado');
    return this.setAuthenticatedUser(request, payload);
  }

  private async setAuthenticatedUser(
    request: AuthenticatedRequest,
    payload: { sub: string; email: string },
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });
    if (!user || user.email !== payload.email) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
    return true;
  }
}
