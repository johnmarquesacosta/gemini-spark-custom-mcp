import { Test, TestingModule } from '@nestjs/testing';
import { McpAuthController } from './mcp-auth.controller';
import { McpAuthService } from './mcp-auth.service';
import { SyncSecretGuard } from '../users/guards/sync-secret.guard';

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
    })
      .overrideGuard(SyncSecretGuard)
      .useValue({ canActivate: () => true })
      .compile();

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

  describe('authorize', () => {
    it('should redirect to frontend oauth consent page', () => {
      const mockReq: any = { method: 'GET', headers: {} };
      const mockRes: any = { redirect: jest.fn() };

      controller.authorize(
        'client-1',
        'http://redirect',
        'state-1',
        'challenge',
        mockReq,
        mockRes,
      );

      expect(mockRes.redirect).toHaveBeenCalled();
      const redirectUrl = new URL(mockRes.redirect.mock.calls[0][0]);
      expect(redirectUrl.pathname).toBe('/oauth/authorize');
      expect(redirectUrl.searchParams.get('client_id')).toBe('client-1');
      expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
        'http://redirect',
      );
      expect(redirectUrl.searchParams.get('state')).toBe('state-1');
      expect(redirectUrl.searchParams.get('code_challenge')).toBe('challenge');
    });
  });

  describe('approve', () => {
    it('should create auth code and return it', () => {
      const result = controller.approve(
        {
          userId: 'test@example.com',
          client_id: 'client-1',
          redirect_uri: 'http://redirect',
          code_challenge: 'challenge',
        },
        { method: 'POST', headers: {} } as any,
      );

      expect(service.createAuthorizationCode).toHaveBeenCalledWith({
        client_id: 'client-1',
        redirect_uri: 'http://redirect',
        code_challenge: 'challenge',
        userId: 'test@example.com',
      });
      expect(result).toEqual({ code: 'code123' });
    });
  });
});
