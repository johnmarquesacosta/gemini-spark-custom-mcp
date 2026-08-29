import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncUserDto {
  @ApiProperty({
    description: 'The email address of the user from Google',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The full name of the user from Google',
    example: 'John Marques',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'The profile picture URL of the user',
    example: 'https://lh3.googleusercontent.com/a/ALm5wu...',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'The Google provider account ID (optional, for future linking)',
    example: '102938475610293847561',
  })
  @IsString()
  @IsOptional()
  googleId?: string;
}
