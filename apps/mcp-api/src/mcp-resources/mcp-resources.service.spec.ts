import { Test, TestingModule } from '@nestjs/testing';
import { McpResourcesService } from './mcp-resources.service';

describe('McpResourcesService', () => {
  let service: McpResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpResourcesService],
    }).compile();

    service = module.get<McpResourcesService>(McpResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleRpcRequest', () => {
    it('should handle initialize', () => {
      const result = service.handleRpcRequest({ method: 'initialize' });
      expect(result).toHaveProperty('protocolVersion', '2024-11-05');
      expect(result).toHaveProperty('serverInfo.name', 'mcp-api');
    });

    it('should handle tools/list', () => {
      const result = service.handleRpcRequest({ method: 'tools/list' });
      expect(result).toEqual({ tools: [] });
    });

    it('should handle prompts/list', () => {
      const result = service.handleRpcRequest({ method: 'prompts/list' });
      expect(result).toEqual({ prompts: [] });
    });

    it('should handle resources/list', () => {
      const result = service.handleRpcRequest({ method: 'resources/list' });
      expect(result).toEqual({ resources: [] });
    });

    it('should return empty object for unknown method', () => {
      const result = service.handleRpcRequest({ method: 'unknown' });
      expect(result).toEqual({});
    });
  });
});
