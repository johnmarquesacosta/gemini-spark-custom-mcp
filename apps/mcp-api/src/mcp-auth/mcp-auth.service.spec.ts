import { Test, TestingModule } from '@nestjs/testing';
import { McpAuthService } from './mcp-auth.service';

describe('McpAuthService', () => {
  let service: McpAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpAuthService],
    }).compile();

    service = module.get<McpAuthService>(McpAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a client', () => {
    const result = service.registerClient(
      ['http://localhost/callback'],
      'TestClient',
    );
    expect(result).toHaveProperty('client_id');
    expect(result.redirect_uris).toEqual(['http://localhost/callback']);
  });

  it('should create authorization code', () => {
    const code = service.createAuthorizationCode({
      client_id: '123',
      redirect_uri: 'http://localhost/callback',
    });
    expect(code).toBeDefined();
    expect(typeof code).toBe('string');
  });
});
