import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { PostBlock } from './entities/post-block.entity';
import { GeneratedImage } from './entities/generated-image.entity';
import { RenderedGraph } from './entities/rendered-graph.entity';
import { PostSource } from './entities/post-source.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { PostsMcpHandler } from './posts.mcp-handler';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesMcpHandler } from './categories.mcp-handler';
import { McpAuthModule } from '../mcp-auth/mcp-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostBlock,
      GeneratedImage,
      RenderedGraph,
      PostSource,
      Category,
      Tag,
    ]),
    McpAuthModule,
  ],
  controllers: [PostsController, CategoriesController],
  providers: [
    PostsService,
    PostsMcpHandler,
    CategoriesService,
    CategoriesMcpHandler,
  ],
  exports: [PostsService, CategoriesService],
})
export class PostsModule {}
