import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RenderedGraph } from '../posts/entities/rendered-graph.entity';
import { PostBlock } from '../posts/entities/post-block.entity';
import { AssetStatus } from '../posts/enums/asset-status.enum';
import { GraphRendererService } from './graph-renderer.service';
import { MinioService } from './minio.service';

export class GraphRequestedEvent {
  constructor(public readonly renderedGraphId: string) {}
}

@Injectable()
export class AssetsListener {
  private readonly logger = new Logger(AssetsListener.name);

  constructor(
    @InjectRepository(RenderedGraph)
    private readonly renderedGraphRepo: Repository<RenderedGraph>,
    @InjectRepository(PostBlock)
    private readonly postBlockRepo: Repository<PostBlock>,
    private readonly graphRenderer: GraphRendererService,
    private readonly minioService: MinioService,
  ) {}

  @OnEvent('graph.requested', { async: true })
  async handleGraphRequestedEvent(payload: GraphRequestedEvent) {
    this.logger.log(
      `Processing graph rendering for ID: ${payload.renderedGraphId}`,
    );

    const graph = await this.renderedGraphRepo.findOne({
      where: { id: payload.renderedGraphId },
    });

    if (!graph) {
      this.logger.warn(
        `RenderedGraph with ID ${payload.renderedGraphId} not found.`,
      );
      return;
    }

    if (
      graph.status === AssetStatus.PROCESSING ||
      graph.status === AssetStatus.READY
    ) {
      this.logger.warn(
        `Graph ${graph.id} is already ${graph.status}. Skipping.`,
      );
      return;
    }

    try {
      // Set to PROCESSING
      await this.renderedGraphRepo.update(graph.id, {
        status: AssetStatus.PROCESSING,
        errorMessage: null,
      });

      // Render the graph
      const { buffer, mimeType, extension } = await this.graphRenderer.render(
        graph.engine,
        graph.spec,
      );

      // Upload to MinIO
      const objectName = `graphs/${graph.id}.${extension}`;
      const assetUrl = await this.minioService.uploadBuffer(
        buffer,
        objectName,
        mimeType,
      );

      // Set to READY
      await this.renderedGraphRepo.update(graph.id, {
        status: AssetStatus.READY,
        assetUrl,
        renderedAt: new Date(),
      });

      this.logger.log(
        `Successfully rendered and uploaded graph ${graph.id} to ${assetUrl}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process graph ${graph.id}: ${error.message}`,
      );

      await this.renderedGraphRepo.update(graph.id, {
        status: AssetStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }
}
