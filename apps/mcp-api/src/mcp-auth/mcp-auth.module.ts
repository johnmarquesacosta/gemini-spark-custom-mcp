import { Module } from '@nestjs/common';
import { McpAuthController } from './mcp-auth.controller';
import { McpAuthService } from './mcp-auth.service';
import { McpAuthGuard } from './mcp-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [McpAuthController],
  providers: [McpAuthService, McpAuthGuard],
  exports: [McpAuthService, McpAuthGuard, UsersModule],
})
export class McpAuthModule {}
