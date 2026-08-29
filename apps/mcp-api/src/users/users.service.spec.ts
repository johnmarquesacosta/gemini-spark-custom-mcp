import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthUser', () => {
    it('should create a new user if one does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const newUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        photoUrl: 'http://photo.url',
      };
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.validateOAuthUser(
        'test@example.com',
        'Test User',
        'http://photo.url',
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        photoUrl: 'http://photo.url',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should update an existing user if name or photo changed', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Old Name',
        photoUrl: 'http://old.photo',
      };
      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue({
        ...existingUser,
        name: 'New Name',
        photoUrl: 'http://new.photo',
      });

      const result = await service.validateOAuthUser(
        'test@example.com',
        'New Name',
        'http://new.photo',
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(existingUser.name).toBe('New Name');
      expect(existingUser.photoUrl).toBe('http://new.photo');
      expect(mockRepository.save).toHaveBeenCalledWith(existingUser);
      expect(result.name).toBe('New Name');
    });

    it('should return existing user without saving if nothing changed', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        photoUrl: 'http://photo.url',
      };
      mockRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.validateOAuthUser(
        'test@example.com',
        'Test User',
        'http://photo.url',
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const user = { id: '123', email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findById('123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(user);
    });
  });
});
