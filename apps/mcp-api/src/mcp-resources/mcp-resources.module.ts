import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McpResourcesController } from './mcp-resources.controller';
import { McpManagementController } from './mcp-management.controller';
import { McpResourcesService } from './mcp-resources.service';
import { McpAuthModule } from '../mcp-auth/mcp-auth.module';
import { McpTool } from './entities/mcp-tool.entity';
import { McpPrompt } from './entities/mcp-prompt.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    McpAuthModule,
    ConfigModule,
    UsersModule,
    TypeOrmModule.forFeature([McpTool, McpPrompt]),
  ],
  controllers: [McpResourcesController, McpManagementController],
  providers: [McpResourcesService],
})
export class McpResourcesModule {}
