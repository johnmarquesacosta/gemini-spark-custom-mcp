import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { McpAuthService } from './mcp-auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(
    private readonly auth: McpAuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      const res = context.switchToHttp().getResponse();
      res.setHeader(
        'WWW-Authenticate',
        `Bearer realm="mcp", error="unauthorized"`,
      );
      throw new UnauthorizedException();
    }

    try {
      const payload = this.auth.verifyToken(token);
      if (typeof payload === 'string' || !payload?.sub) {
        throw new UnauthorizedException();
      }

      const user = await this.usersService.findById(payload.sub as string);
      if (!user) throw new UnauthorizedException();

      req.user = {
        ...payload,
        sub: user.id, // Garante que o sub é sempre o UUID do usuário
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
