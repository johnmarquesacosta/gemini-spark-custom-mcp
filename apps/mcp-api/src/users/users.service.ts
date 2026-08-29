import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SyncUserDto } from './dtos/sync-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async syncUser(body: SyncUserDto) {
    const user = await this.validateOAuthUser(body.email, body.name, body.image);

    this.logger.log(`User synced successfully: ${user.email} (ID: ${user.id})`);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async validateOAuthUser(
    email: string,
    name: string,
    photoUrl?: string,
  ): Promise<User> {
    let user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      this.logger.log(`Creating new user for email: ${email}`);
      user = this.usersRepository.create({
        email,
        name,
        photoUrl,
      });
      await this.usersRepository.save(user);
    } else {
      let updated = false;
      if (user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (photoUrl && user.photoUrl !== photoUrl) {
        user.photoUrl = photoUrl;
        updated = true;
      }

      if (updated) {
        this.logger.log(`Updating existing user for email: ${email}`);
        await this.usersRepository.save(user);
      }
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
