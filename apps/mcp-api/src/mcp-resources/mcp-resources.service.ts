import { Injectable } from '@nestjs/common';

@Injectable()
export class McpResourcesService {
  handleRpcRequest(rpcRequest: any) {
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
      case 'tools/list':
        result = { tools: [] };
        break;
      case 'prompts/list':
        result = { prompts: [] };
        break;
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
