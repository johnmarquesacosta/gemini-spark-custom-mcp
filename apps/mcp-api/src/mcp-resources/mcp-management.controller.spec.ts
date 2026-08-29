import { Test, TestingModule } from '@nestjs/testing';
import { McpManagementController } from './mcp-management.controller';
import { McpResourcesService } from './mcp-resources.service';
import { SyncSecretGuard } from '../users/guards/sync-secret.guard';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('McpManagementController', () => {
  let controller: McpManagementController;
  let service: McpResourcesService;

  const mockMcpResourcesService = {
    listTools: jest.fn(),
    createTool: jest.fn(),
    deleteTool: jest.fn(),
    listPrompts: jest.fn(),
    createPrompt: jest.fn(),
    deletePrompt: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [McpManagementController],
      providers: [
        {
          provide: McpResourcesService,
          useValue: mockMcpResourcesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        }
      ],
    })
    .overrideGuard(SyncSecretGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<McpManagementController>(McpManagementController);
    service = module.get<McpResourcesService>(McpResourcesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Tools Management', () => {
    it('should list tools for a specific user via query param', async () => {
      mockMcpResourcesService.listTools.mockResolvedValue([]);
      const result = await controller.listTools('user-1');
      expect(service.listTools).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([]);
    });

    it('should require userId query param for listTools', async () => {
      await expect(controller.listTools(undefined)).rejects.toThrow(UnauthorizedException);
    });

    it('should create a tool', async () => {
      const dto = { name: 'Test', description: 'Test' };
      mockMcpResourcesService.createTool.mockResolvedValue({ id: '1', ...dto });
      const result = await controller.createTool('user-1', dto);
      expect(service.createTool).toHaveBeenCalledWith('user-1', dto);
      expect(result.id).toBe('1');
    });

    it('should delete a tool', async () => {
      await controller.deleteTool('tool-1', 'user-1');
      expect(service.deleteTool).toHaveBeenCalledWith('user-1', 'tool-1');
    });
  });

  describe('Prompts Management', () => {
    it('should list prompts for a specific user via query param', async () => {
      mockMcpResourcesService.listPrompts.mockResolvedValue([]);
      const result = await controller.listPrompts('user-1');
      expect(service.listPrompts).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([]);
    });

    it('should create a prompt', async () => {
      const dto = { name: 'Test', description: 'Test', content: 'Test' };
      mockMcpResourcesService.createPrompt.mockResolvedValue({ id: '1', ...dto });
      const result = await controller.createPrompt('user-1', dto);
      expect(service.createPrompt).toHaveBeenCalledWith('user-1', dto);
      expect(result.id).toBe('1');
    });

    it('should delete a prompt', async () => {
      await controller.deletePrompt('prompt-1', 'user-1');
      expect(service.deletePrompt).toHaveBeenCalledWith('user-1', 'prompt-1');
    });
  });
});
