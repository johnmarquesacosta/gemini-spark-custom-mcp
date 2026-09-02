import { Test, TestingModule } from '@nestjs/testing';
import { AssetsListener, GraphRequestedEvent } from './assets.listener';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RenderedGraph } from '../posts/entities/rendered-graph.entity';
import { PostBlock } from '../posts/entities/post-block.entity';
import { GraphRendererService } from './graph-renderer.service';
import { MinioService } from './minio.service';
import { AssetStatus } from '../posts/enums/asset-status.enum';

describe('AssetsListener', () => {
  let listener: AssetsListener;
  let renderedGraphRepo: any;
  let graphRenderer: any;
  let minioService: any;

  beforeEach(async () => {
    renderedGraphRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };
    graphRenderer = {
      render: jest.fn(),
    };
    minioService = {
      uploadBuffer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsListener,
        {
          provide: getRepositoryToken(RenderedGraph),
          useValue: renderedGraphRepo,
        },
        {
          provide: getRepositoryToken(PostBlock),
          useValue: {},
        },
        {
          provide: GraphRendererService,
          useValue: graphRenderer,
        },
        {
          provide: MinioService,
          useValue: minioService,
        },
      ],
    }).compile();

    listener = module.get<AssetsListener>(AssetsListener);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  it('should process graph rendering successfully', async () => {
    const graphId = '123';
    const mockGraph = {
      id: graphId,
      status: AssetStatus.PENDING,
      engine: 'mermaid',
      spec: 'A->B',
    };
    renderedGraphRepo.findOne.mockResolvedValue(mockGraph);
    graphRenderer.render.mockResolvedValue({
      buffer: Buffer.from('data'),
      mimeType: 'image/svg+xml',
      extension: 'svg',
    });
    minioService.uploadBuffer.mockResolvedValue(
      'http://minio/assets/graph.svg',
    );

    await listener.handleGraphRequestedEvent(new GraphRequestedEvent(graphId));

    expect(renderedGraphRepo.update).toHaveBeenCalledWith(
      graphId,
      expect.objectContaining({ status: AssetStatus.PROCESSING }),
    );
    expect(renderedGraphRepo.update).toHaveBeenCalledWith(
      graphId,
      expect.objectContaining({
        status: AssetStatus.READY,
        assetUrl: 'http://minio/assets/graph.svg',
      }),
    );
  });
});
