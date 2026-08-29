import { Module } from '@nestjs/common';
import { McpAuthController } from './mcp-auth.controller';
import { McpAuthService } from './mcp-auth.service';
import { McpAuthGuard } from './mcp-auth.guard';

@Module({
  controllers: [McpAuthController],
  providers: [McpAuthService, McpAuthGuard],
  exports: [McpAuthService, McpAuthGuard],
})
export class McpAuthModule {}
