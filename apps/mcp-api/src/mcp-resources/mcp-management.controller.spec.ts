import { Test, TestingModule } from '@nestjs/testing';
import { McpManagementController } from './mcp-management.controller';
import { McpResourcesService } from './mcp-resources.service';
import { SyncSecretGuard } from '../users/guards/sync-secret.guard';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

describe('McpManagementController', () => {
  let controller: McpManagementController;
  let service: McpResourcesService;
  let usersService: UsersService;

  const mockMcpResourcesService = {
    listTools: jest.fn(),
    createTool: jest.fn(),
    deleteTool: jest.fn(),
    listPrompts: jest.fn(),
    createPrompt: jest.fn(),
    deletePrompt: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
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
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(SyncSecretGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<McpManagementController>(McpManagementController);
    service = module.get<McpResourcesService>(McpResourcesService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Tools Management', () => {
    it('should list tools for a specific user via query param', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-uuid' });
      mockMcpResourcesService.listTools.mockResolvedValue([]);

      const result = await controller.listTools('test@example.com');

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(service.listTools).toHaveBeenCalledWith('user-uuid');
      expect(result).toEqual([]);
    });

    it('should require userId query param for listTools', async () => {
      await expect(
        controller.listTools(undefined as unknown as string),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(controller.listTools('test@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should create a tool', async () => {
      const dto = { name: 'Test', description: 'Test' };
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-uuid' });
      mockMcpResourcesService.createTool.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.createTool('test@example.com', dto);

      expect(service.createTool).toHaveBeenCalledWith('user-uuid', dto);
      expect(result.id).toBe('1');
    });

    it('should delete a tool', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-uuid' });
      await controller.deleteTool('tool-1', 'test@example.com');
      expect(service.deleteTool).toHaveBeenCalledWith('user-uuid', 'tool-1');
    });
  });

  describe('Prompts Management', () => {
    it('should list prompts for a specific user via query param', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-uuid' });
      mockMcpResourcesService.listPrompts.mockResolvedValue([]);

      const result = await controller.listPrompts('test@example.com');

      expect(service.listPrompts).toHaveBeenCalledWith('user-uuid');
      expect(result).toEqual([]);
    });

    it('should create a prompt', async () => {
      const dto = { name: 'Test', description: 'Test', content: 'Test' };
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-uuid' });
      mockMcpResourcesService.createPrompt.mockResolvedValue({
        id: '1',
        ...dto,
      });

      const result = await controller.createPrompt('test@example.com', dto);

      expect(service.createPrompt).toHaveBeenCalledWith('user-uuid', dto);
      expect(result.id).toBe('1');
    });

    it('should delete a prompt', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-uuid' });
      await controller.deletePrompt('prompt-1', 'test@example.com');
      expect(service.deletePrompt).toHaveBeenCalledWith(
        'user-uuid',
        'prompt-1',
      );
    });
  });
});
