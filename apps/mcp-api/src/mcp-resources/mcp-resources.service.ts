import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpTool } from './entities/mcp-tool.entity';
import { McpPrompt } from './entities/mcp-prompt.entity';
import { PostsService } from '../posts/posts.service';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateToolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  inputSchema?: any;
}

export class CreatePromptDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  arguments?: any;
}

@Injectable()
export class McpResourcesService {
  constructor(
    @InjectRepository(McpTool)
    private toolRepository: Repository<McpTool>,
    @InjectRepository(McpPrompt)
    private promptRepository: Repository<McpPrompt>,
    private readonly postsService: PostsService,
  ) {}

  async listTools(userId: string): Promise<McpTool[]> {
    return this.toolRepository.find({ where: { userId } });
  }

  async createTool(userId: string, data: CreateToolDto): Promise<McpTool> {
    const tool = this.toolRepository.create({ ...data, userId });
    return this.toolRepository.save(tool);
  }

  async deleteTool(userId: string, toolId: string): Promise<void> {
    await this.toolRepository.delete({ id: toolId, userId });
  }

  async listPrompts(userId: string): Promise<McpPrompt[]> {
    return this.promptRepository.find({ where: { userId } });
  }

  async createPrompt(
    userId: string,
    data: CreatePromptDto,
  ): Promise<McpPrompt> {
    const prompt = this.promptRepository.create({ ...data, userId });
    return this.promptRepository.save(prompt);
  }

  async deletePrompt(userId: string, promptId: string): Promise<void> {
    await this.promptRepository.delete({ id: promptId, userId });
  }

  async handleRpcRequest(userId: string, rpcRequest: any) {
    let result: any = {};

    switch (rpcRequest?.method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {},
          serverInfo: {
            name: 'mcp-api',
            version: '0.0.1',
          },
        };
        break;
      case 'tools/list': {
        const userTools = await this.listTools(userId);

        // Static tools available to all authenticated users
        const staticTools = [
          {
            name: 'posts_list',
            description: 'List all posts for the current user',
            inputSchema: { type: 'object', properties: {} },
          },
          {
            name: 'posts_get',
            description: 'Get a single post by ID',
            inputSchema: {
              type: 'object',
              properties: { id: { type: 'string' } },
              required: ['id'],
            },
          },
          {
            name: 'posts_create',
            description: 'Create a new post',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                slug: { type: 'string' },
                excerpt: { type: 'string' },
                content: { type: 'string' },
                metaTitle: { type: 'string' },
                metaDescription: { type: 'string' },
                focusKeyword: { type: 'string' },
                language: { type: 'string' },
                categoryId: { type: 'string' },
              },
              required: [
                'title',
                'slug',
                'excerpt',
                'content',
                'metaTitle',
                'metaDescription',
                'focusKeyword',
                'language',
                'categoryId',
              ],
            },
          },
          {
            name: 'posts_update',
            description: 'Update a post',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                content: { type: 'string' },
              },
              required: ['id'],
            },
          },
          {
            name: 'posts_publish',
            description: 'Publish a post',
            inputSchema: {
              type: 'object',
              properties: { id: { type: 'string' } },
              required: ['id'],
            },
          },
          {
            name: 'posts_delete',
            description: 'Delete a post',
            inputSchema: {
              type: 'object',
              properties: { id: { type: 'string' } },
              required: ['id'],
            },
          },
        ];

        result = { tools: [...staticTools, ...userTools] };
        break;
      }
      case 'tools/call': {
        const toolName = rpcRequest.params?.name;
        const toolArgs = rpcRequest.params?.arguments || {};

        try {
          let callResult;

          if (toolName === 'posts_list') {
            callResult = await this.postsService.findAll(userId);
          } else if (toolName === 'posts_get') {
            callResult = await this.postsService.findOne(toolArgs.id, userId);
          } else if (toolName === 'posts_create') {
            callResult = await this.postsService.create(userId, toolArgs);
          } else if (toolName === 'posts_update') {
            const { id, ...updateData } = toolArgs;
            callResult = await this.postsService.update(id, userId, updateData);
          } else if (toolName === 'posts_publish') {
            callResult = await this.postsService.publish(toolArgs.id, userId);
          } else if (toolName === 'posts_delete') {
            await this.postsService.remove(toolArgs.id, userId);
            callResult = { success: true };
          } else {
            throw new Error(`Tool not found: ${toolName}`);
          }

          result = {
            content: [
              {
                type: 'text',
                text: JSON.stringify(callResult, null, 2),
              },
            ],
          };
        } catch (error: any) {
          result = {
            isError: true,
            content: [
              {
                type: 'text',
                text: error.message || 'Unknown error during tool execution',
              },
            ],
          };
        }
        break;
      }
      case 'prompts/list': {
        const prompts = await this.listPrompts(userId);
        result = { prompts };
        break;
      }
      case 'resources/list':
        result = { resources: [] };
        break;
      default:
        // Fallback genérico (pode ser ajustado para retornar erro JSON-RPC Method Not Found futuramente)
        result = {};
    }

    return result;
  }
}
