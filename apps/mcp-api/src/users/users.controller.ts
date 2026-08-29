import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SyncSecretGuard } from './guards/sync-secret.guard';
import { SyncUserDto } from './dtos/sync-user.dto';

@ApiTags('Users Auth')
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SyncSecretGuard)
  @ApiOperation({
    summary: 'Sync User from Frontend',
    description: 'Receives user data from NextAuth and creates/updates the user in the database.',
  })
  @ApiHeader({
    name: 'x-sync-secret',
    description: 'Shared secret between frontend and backend to authorize sync',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User synced successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid payload.' })
  @ApiResponse({ status: 401, description: 'Invalid or missing sync secret.' })
  async syncUser(@Body() body: SyncUserDto) {
    return this.usersService.syncUser(body);
  }
}
