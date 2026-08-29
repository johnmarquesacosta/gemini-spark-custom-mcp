import { Test, TestingModule } from '@nestjs/testing';
import { McpResourcesController } from './mcp-resources.controller';
import { McpResourcesService } from './mcp-resources.service';
import { McpAuthService } from '../mcp-auth/mcp-auth.service';

describe('McpResourcesController', () => {
  let controller: McpResourcesController;
  let resourcesService: McpResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [McpResourcesController],
      providers: [
        McpResourcesService,
        {
          provide: McpAuthService,
          useValue: {
            verifyToken: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<McpResourcesController>(McpResourcesController);
    resourcesService = module.get<McpResourcesService>(McpResourcesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('mcp (GET)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should setup SSE connection', () => {
      let closeCallback: any;
      const mockReq: any = {
        method: 'GET',
        url: '/mcp',
        on: jest.fn((event, cb) => {
          if (event === 'close') closeCallback = cb;
        }),
      };
      const mockRes: any = {
        set: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      };

      controller.mcp(mockReq, mockRes);

      expect(mockRes.set).toHaveBeenCalledWith(
        'Content-Type',
        'text/event-stream',
      );
      expect(mockRes.write).toHaveBeenCalledWith('event: endpoint\n');

      if (closeCallback) {
        closeCallback();
      }
    });
  });

  describe('handleMcpPost (POST)', () => {
    it('should handle notification (without id)', async () => {
      const mockReq: any = {
        method: 'POST',
        body: { jsonrpc: '2.0', method: 'notify' },
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.handleMcpPost(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle RPC request with id', async () => {
      const mockReq: any = {
        body: { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      };
      const mockRes: any = {
        json: jest.fn(),
      };

      jest
        .spyOn(resourcesService, 'handleRpcRequest')
        .mockReturnValue({ tools: [] });

      await controller.handleMcpPost(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: { tools: [] },
      });
    });
  });
});
