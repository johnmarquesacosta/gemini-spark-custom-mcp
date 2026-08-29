import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpTool } from './entities/mcp-tool.entity';
import { McpPrompt } from './entities/mcp-prompt.entity';

export class CreateToolDto {
  name: string;
  description: string;
  inputSchema?: any;
}

export class CreatePromptDto {
  name: string;
  description: string;
  content: string;
  arguments?: any;
}

@Injectable()
export class McpResourcesService {
  constructor(
    @InjectRepository(McpTool)
    private toolRepository: Repository<McpTool>,
    @InjectRepository(McpPrompt)
    private promptRepository: Repository<McpPrompt>,
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
        const tools = await this.listTools(userId);
        result = { tools };
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
