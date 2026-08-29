import { Test, TestingModule } from '@nestjs/testing';
import { McpAuthController } from './mcp-auth.controller';
import { McpAuthService } from './mcp-auth.service';

describe('McpAuthController', () => {
  let controller: McpAuthController;
  let service: McpAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [McpAuthController],
      providers: [
        {
          provide: McpAuthService,
          useValue: {
            registerClient: jest.fn().mockReturnValue({ client_id: 'test' }),
            createAuthorizationCode: jest.fn().mockReturnValue('code123'),
            exchangeToken: jest.fn().mockReturnValue({ access_token: 'token' }),
          },
        },
      ],
    }).compile();

    controller = module.get<McpAuthController>(McpAuthController);
    service = module.get<McpAuthService>(McpAuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('protectedResource should return the resource', () => {
    const mockReq: any = { method: 'GET', headers: {} };
    const res = controller.protectedResource(mockReq);
    expect(res).toHaveProperty('resource');
  });

  it('authServerMetadata should return metadata', () => {
    const mockReq: any = { method: 'GET', headers: {} };
    const res = controller.authServerMetadata(mockReq);
    expect(res).toHaveProperty('issuer');
  });
});
