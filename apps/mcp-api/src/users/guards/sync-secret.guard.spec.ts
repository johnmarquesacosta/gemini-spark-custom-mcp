import { Test, TestingModule } from '@nestjs/testing';
import { SyncSecretGuard } from './sync-secret.guard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('SyncSecretGuard', () => {
  let guard: SyncSecretGuard;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncSecretGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<SyncSecretGuard>(SyncSecretGuard);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when secret matches AUTH_SECRET', () => {
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'AUTH_SECRET') return 'valid-secret';
      return undefined;
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-sync-secret': 'valid-secret',
          },
          ip: '127.0.0.1',
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return true when secret matches JWT_SECRET fallback', () => {
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'AUTH_SECRET') return undefined;
      if (key === 'JWT_SECRET') return 'valid-jwt-secret';
      return undefined;
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-sync-secret': 'valid-jwt-secret',
          },
          ip: '127.0.0.1',
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedException when secret is missing', () => {
    mockConfigService.get.mockReturnValue('valid-secret');

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          ip: '127.0.0.1',
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when secret does not match', () => {
    mockConfigService.get.mockReturnValue('valid-secret');

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-sync-secret': 'wrong-secret',
          },
          ip: '127.0.0.1',
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });
});
