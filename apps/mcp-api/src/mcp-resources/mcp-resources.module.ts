import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { McpResourcesController } from './mcp-resources.controller';
import { McpManagementController } from './mcp-management.controller';
import { McpResourcesService } from './mcp-resources.service';
import { McpAuthModule } from '../mcp-auth/mcp-auth.module';
import { McpTool } from './entities/mcp-tool.entity';
import { McpPrompt } from './entities/mcp-prompt.entity';
import { UsersModule } from '../users/users.module';
import { McpRegistryService } from './mcp-registry.service';
import { McpDiscoveryService } from './mcp-discovery.service';

@Module({
  imports: [
    McpAuthModule,
    ConfigModule,
    DiscoveryModule,
    UsersModule,
    TypeOrmModule.forFeature([McpTool, McpPrompt]),
  ],
  controllers: [McpResourcesController, McpManagementController],
  providers: [McpResourcesService, McpRegistryService, McpDiscoveryService],
})
export class McpResourcesModule {}
