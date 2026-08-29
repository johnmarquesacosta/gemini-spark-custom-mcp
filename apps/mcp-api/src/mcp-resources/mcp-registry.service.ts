import { Injectable, Logger } from '@nestjs/common';
import { McpToolOptions } from './decorators/mcp-tool.decorator';

export interface RegisteredMcpTool extends McpToolOptions {
  instance: any;
  methodName: string;
}

@Injectable()
export class McpRegistryService {
  private readonly logger = new Logger(McpRegistryService.name);
  private readonly tools = new Map<string, RegisteredMcpTool>();

  registerTool(tool: RegisteredMcpTool) {
    if (this.tools.has(tool.name)) {
      this.logger.warn(`MCP Tool '${tool.name}' is being overwritten.`);
    }
    this.tools.set(tool.name, tool);
    this.logger.debug(`Registered MCP tool: ${tool.name}`);
  }

  getTool(name: string): RegisteredMcpTool | undefined {
    return this.tools.get(name);
  }

  getTools(): RegisteredMcpTool[] {
    return Array.from(this.tools.values());
  }
}
