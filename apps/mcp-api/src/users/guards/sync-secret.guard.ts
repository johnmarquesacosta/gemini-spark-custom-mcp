import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SyncSecretGuard implements CanActivate {
  private readonly logger = new Logger(SyncSecretGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const syncSecret = request.headers['x-sync-secret'];

    const expectedSecret =
      this.configService.get<string>('AUTH_SECRET') ||
      this.configService.get<string>('JWT_SECRET');

    if (!syncSecret || syncSecret !== expectedSecret) {
      this.logger.warn(
        `Invalid sync attempt from IP ${request.ip}. Secret mismatch.`,
      );
      throw new UnauthorizedException('Invalid sync secret');
    }

    return true;
  }
}
