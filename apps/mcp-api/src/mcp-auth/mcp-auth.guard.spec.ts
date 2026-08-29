import { McpAuthGuard } from './mcp-auth.guard';
import { McpAuthService } from './mcp-auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('McpAuthGuard', () => {
  let guard: McpAuthGuard;
  let service: McpAuthService;

  beforeEach(() => {
    service = { verifyToken: jest.fn() } as unknown as McpAuthService;
    guard = new McpAuthGuard(service);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token is provided', () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
        getResponse: () => ({ setHeader: jest.fn() }),
      }),
    };

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should return true if token is valid', () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    };
    (service.verifyToken as jest.Mock).mockReturnValue(true);

    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
