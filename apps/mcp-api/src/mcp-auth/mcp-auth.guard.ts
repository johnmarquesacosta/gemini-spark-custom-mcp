import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { McpAuthService } from './mcp-auth.service';

@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(private readonly auth: McpAuthService) {}

  canActivate(context: ExecutionContext): boolean {
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
      req.user = this.auth.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
