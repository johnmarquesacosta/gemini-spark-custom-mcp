import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioService } from './minio.service';
import { GraphRendererService } from './graph-renderer.service';
import { AssetsListener } from './assets.listener';
import { RenderedGraph } from '../posts/entities/rendered-graph.entity';
import { PostBlock } from '../posts/entities/post-block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RenderedGraph, PostBlock])],
  providers: [MinioService, GraphRendererService, AssetsListener],
  exports: [MinioService],
})
export class AssetsModule {}
