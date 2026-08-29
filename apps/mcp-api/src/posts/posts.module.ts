import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';
import { PostSource } from './entities/post-source.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { PostsMcpHandler } from './posts.mcp-handler';

import { McpAuthModule } from '../mcp-auth/mcp-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostImage, PostSource, Category, Tag]),
    McpAuthModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsMcpHandler],
  exports: [PostsService],
})
export class PostsModule {}
