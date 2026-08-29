import { Module } from '@nestjs/common';
import { McpResourcesController } from './mcp-resources.controller';
import { McpResourcesService } from './mcp-resources.service';
import { McpAuthModule } from '../mcp-auth/mcp-auth.module';

@Module({
  imports: [McpAuthModule],
  controllers: [McpResourcesController],
  providers: [McpResourcesService],
})
export class McpResourcesModule {}
