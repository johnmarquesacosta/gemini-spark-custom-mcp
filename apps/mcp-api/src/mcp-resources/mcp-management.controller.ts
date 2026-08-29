import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { McpResourcesService, CreateToolDto, CreatePromptDto } from './mcp-resources.service';
import { SyncSecretGuard } from '../users/guards/sync-secret.guard';

@ApiTags('MCP Management')
@Controller('mcp-management')
@UseGuards(SyncSecretGuard)
@ApiHeader({
  name: 'x-sync-secret',
  description: 'Shared secret between frontend and backend to authorize S2S management',
  required: true,
})
export class McpManagementController {
  constructor(private readonly resourcesService: McpResourcesService) {}

  @Get('tools')
  @ApiOperation({ summary: 'List tools for a user' })
  @ApiQuery({ name: 'userId', required: true })
  async listTools(@Query('userId') userId: string) {
    if (!userId) throw new UnauthorizedException('userId is required');
    return this.resourcesService.listTools(userId);
  }

  @Post('tools')
  @ApiOperation({ summary: 'Create a tool for a user' })
  @ApiQuery({ name: 'userId', required: true })
  async createTool(@Query('userId') userId: string, @Body() data: CreateToolDto) {
    if (!userId) throw new UnauthorizedException('userId is required');
    return this.resourcesService.createTool(userId, data);
  }

  @Delete('tools/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tool for a user' })
  @ApiQuery({ name: 'userId', required: true })
  async deleteTool(@Param('id') toolId: string, @Query('userId') userId: string) {
    if (!userId) throw new UnauthorizedException('userId is required');
    return this.resourcesService.deleteTool(userId, toolId);
  }

  @Get('prompts')
  @ApiOperation({ summary: 'List prompts for a user' })
  @ApiQuery({ name: 'userId', required: true })
  async listPrompts(@Query('userId') userId: string) {
    if (!userId) throw new UnauthorizedException('userId is required');
    return this.resourcesService.listPrompts(userId);
  }

  @Post('prompts')
  @ApiOperation({ summary: 'Create a prompt for a user' })
  @ApiQuery({ name: 'userId', required: true })
  async createPrompt(@Query('userId') userId: string, @Body() data: CreatePromptDto) {
    if (!userId) throw new UnauthorizedException('userId is required');
    return this.resourcesService.createPrompt(userId, data);
  }

  @Delete('prompts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a prompt for a user' })
  @ApiQuery({ name: 'userId', required: true })
  async deletePrompt(@Param('id') promptId: string, @Query('userId') userId: string) {
    if (!userId) throw new UnauthorizedException('userId is required');
    return this.resourcesService.deletePrompt(userId, promptId);
  }
}
