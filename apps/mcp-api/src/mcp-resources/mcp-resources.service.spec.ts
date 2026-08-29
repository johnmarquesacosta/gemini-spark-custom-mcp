import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { McpResourcesService } from './mcp-resources.service';
import { McpTool } from './entities/mcp-tool.entity';
import { McpPrompt } from './entities/mcp-prompt.entity';

describe('McpResourcesService', () => {
  let service: McpResourcesService;

  const mockToolRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockPromptRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpResourcesService,
        {
          provide: getRepositoryToken(McpTool),
          useValue: mockToolRepository,
        },
        {
          provide: getRepositoryToken(McpPrompt),
          useValue: mockPromptRepository,
        },
      ],
    }).compile();

    service = module.get<McpResourcesService>(McpResourcesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleRpcRequest', () => {
    it('should handle initialize', async () => {
      const result = await service.handleRpcRequest('user-1', {
        method: 'initialize',
      });
      expect(result).toHaveProperty('protocolVersion', '2024-11-05');
      expect(result).toHaveProperty('serverInfo.name', 'mcp-api');
    });

    it('should handle tools/list', async () => {
      mockToolRepository.find.mockResolvedValue([]);
      const result = await service.handleRpcRequest('user-1', {
        method: 'tools/list',
      });
      expect(result).toEqual({ tools: [] });
    });

    it('should handle prompts/list', async () => {
      mockPromptRepository.find.mockResolvedValue([]);
      const result = await service.handleRpcRequest('user-1', {
        method: 'prompts/list',
      });
      expect(result).toEqual({ prompts: [] });
    });

    it('should handle resources/list', async () => {
      const result = await service.handleRpcRequest('user-1', {
        method: 'resources/list',
      });
      expect(result).toEqual({ resources: [] });
    });

    it('should return empty object for unknown method', async () => {
      const result = await service.handleRpcRequest('user-1', {
        method: 'unknown',
      });
      expect(result).toEqual({});
    });
  });

  describe('CRUD Operations', () => {
    it('should list tools for a user', async () => {
      mockToolRepository.find.mockResolvedValue([{ id: '1', name: 'My Tool' }]);
      const result = await service.listTools('user-1');
      expect(mockToolRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual([{ id: '1', name: 'My Tool' }]);
    });

    it('should create a tool for a user', async () => {
      const toolDto = { name: 'My Tool', description: 'Desc', inputSchema: {} };
      mockToolRepository.create.mockReturnValue({
        ...toolDto,
        userId: 'user-1',
      });
      mockToolRepository.save.mockResolvedValue({
        id: '1',
        ...toolDto,
        userId: 'user-1',
      });

      const result = await service.createTool('user-1', toolDto);

      expect(mockToolRepository.create).toHaveBeenCalledWith({
        ...toolDto,
        userId: 'user-1',
      });
      expect(mockToolRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('1');
    });

    it('should delete a tool for a user', async () => {
      mockToolRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteTool('user-1', 'tool-1');
      expect(mockToolRepository.delete).toHaveBeenCalledWith({
        id: 'tool-1',
        userId: 'user-1',
      });
    });

    it('should list prompts for a user', async () => {
      mockPromptRepository.find.mockResolvedValue([
        { id: '1', name: 'My Prompt' },
      ]);
      const result = await service.listPrompts('user-1');
      expect(mockPromptRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual([{ id: '1', name: 'My Prompt' }]);
    });

    it('should create a prompt for a user', async () => {
      const promptDto = {
        name: 'My Prompt',
        description: 'Desc',
        content: 'Prompt content',
      };
      mockPromptRepository.create.mockReturnValue({
        ...promptDto,
        userId: 'user-1',
      });
      mockPromptRepository.save.mockResolvedValue({
        id: '1',
        ...promptDto,
        userId: 'user-1',
      });

      const result = await service.createPrompt('user-1', promptDto);

      expect(mockPromptRepository.create).toHaveBeenCalledWith({
        ...promptDto,
        userId: 'user-1',
      });
      expect(mockPromptRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('1');
    });

    it('should delete a prompt for a user', async () => {
      mockPromptRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deletePrompt('user-1', 'prompt-1');
      expect(mockPromptRepository.delete).toHaveBeenCalledWith({
        id: 'prompt-1',
        userId: 'user-1',
      });
    });
  });
});
