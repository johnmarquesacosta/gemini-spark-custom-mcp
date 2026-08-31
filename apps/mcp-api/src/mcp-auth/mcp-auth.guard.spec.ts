import { McpAuthGuard } from './mcp-auth.guard';
import { McpAuthService } from './mcp-auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

describe('McpAuthGuard', () => {
  let guard: McpAuthGuard;
  let service: McpAuthService;
  let usersService: UsersService;

  beforeEach(() => {
    service = { verifyToken: jest.fn() } as unknown as McpAuthService;
    usersService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
    } as unknown as UsersService;
    guard = new McpAuthGuard(service, usersService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
        getResponse: () => ({ setHeader: jest.fn() }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if verifyToken fails', async () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    };
    (service.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    };
    (service.verifyToken as jest.Mock).mockReturnValue({
      sub: 'test@example.com',
    });
    (usersService.findById as jest.Mock).mockResolvedValue(null);
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return true and attach user UUID if token is valid', async () => {
    const mockRequest: any = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    };

    (service.verifyToken as jest.Mock).mockReturnValue({
      sub: 'test@example.com',
    });
    (usersService.findById as jest.Mock).mockResolvedValue({
      id: 'user-uuid',
    });
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      id: 'user-uuid',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({
      sub: 'user-uuid',
    });
  });
});
