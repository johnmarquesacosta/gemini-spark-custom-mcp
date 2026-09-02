import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PostStatus } from '../enums/post-status.enum';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({ enum: PostStatus, description: 'Change post status' })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
