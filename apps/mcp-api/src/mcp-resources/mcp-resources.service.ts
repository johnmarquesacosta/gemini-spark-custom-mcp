import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpTool } from './entities/mcp-tool.entity';
import { McpPrompt } from './entities/mcp-prompt.entity';
import { McpRegistryService } from './mcp-registry.service';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateToolDto {
  @ApiProperty({
    example: 'search_web',
    description: 'Unique name of the tool',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Searches the web for a given query',
    description: 'Human-readable description of what the tool does',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    example: { type: 'object', properties: { query: { type: 'string' } } },
    description: 'JSON Schema describing the tool input parameters',
  })
  @IsOptional()
  inputSchema?: Record<string, unknown>;
}

export class CreatePromptDto {
  @ApiProperty({
    example: 'summarize',
    description: 'Unique name of the prompt',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Summarizes a given text into bullet points',
    description: 'Human-readable description of the prompt',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Summarize the following text: {{text}}',
    description: 'The prompt template content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: [
      { name: 'text', description: 'The text to summarize', required: true },
    ],
    description: 'List of arguments the prompt accepts',
  })
  @IsOptional()
  arguments?: Record<string, unknown>[];
}

@Injectable()
export class McpResourcesService {
  constructor(
    @InjectRepository(McpTool)
    private toolRepository: Repository<McpTool>,
    @InjectRepository(McpPrompt)
    private promptRepository: Repository<McpPrompt>,
    private readonly registryService: McpRegistryService,
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
        const registeredTools = this.registryService.getTools().map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema || { type: 'object', properties: {} },
        }));

        result = { tools: [...registeredTools, ...userTools] };
        break;
      }
      case 'tools/call': {
        const toolName = rpcRequest.params?.name;
        const toolArgs = rpcRequest.params?.arguments || {};

        try {
          let callResult;
          const registeredTool = this.registryService.getTool(toolName);

          if (registeredTool) {
            // Dynamically invoke the registered tool method
            callResult = await registeredTool.instance[
              registeredTool.methodName
            ](userId, toolArgs);
          } else {
            // Dynamic custom tools stored in the DB (future feature)
            throw new Error(`Tool not found: ${toolName}`);
          }

          result = {
            content: [
              {
                type: 'text',
                text:
                  typeof callResult === 'string'
                    ? callResult
                    : JSON.stringify(callResult, null, 2),
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
