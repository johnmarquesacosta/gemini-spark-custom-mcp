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

    console.log(
      `[McpAuthGuard] Check - URL: ${req.url}, Method: ${req.method}, Token present: ${!!token}`,
    );

    if (!token) {
      console.log(`[McpAuthGuard] No token provided`);
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
        console.log(`[McpAuthGuard] Invalid payload`);
        throw new UnauthorizedException();
      }

      const subStr = payload.sub as string;
      const user = subStr.includes('@')
        ? await this.usersService.findByEmail(subStr)
        : await this.usersService.findById(subStr);

      if (!user) {
        console.log(`[McpAuthGuard] User not found for sub: ${payload.sub}`);
        throw new UnauthorizedException();
      }

      req.user = {
        ...payload,
        sub: user.id, // Garante que o sub é sempre o UUID do usuário
      };
      console.log(`[McpAuthGuard] Authorized user: ${user.email}`);
      return true;
    } catch (err: any) {
      console.log(`[McpAuthGuard] Error verifying token:`, err.message);
      throw new UnauthorizedException();
    }
  }
}
