import { Test, TestingModule } from '@nestjs/testing';
import { GraphRendererService } from './graph-renderer.service';
import { GraphEngine } from '../posts/enums/graph-engine.enum';

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setViewport: jest.fn(),
      setContent: jest.fn(),
      waitForSelector: jest.fn().mockResolvedValue({}),
      evaluate: jest.fn().mockResolvedValue('<svg></svg>'),
      close: jest.fn(),
    }),
    close: jest.fn(),
  }),
}));

jest.mock('chartjs-node-canvas', () => {
  return {
    ChartJSNodeCanvas: jest.fn().mockImplementation(() => ({
      renderToBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-png')),
    })),
  };
});

describe('GraphRendererService', () => {
  let service: GraphRendererService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphRendererService],
    }).compile();

    service = module.get<GraphRendererService>(GraphRendererService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should render mermaid graph to svg', async () => {
    const spec = 'graph TD; A-->B;';
    const result = await service.render(GraphEngine.MERMAID, spec);
    expect(result.mimeType).toBe('image/svg+xml');
    expect(result.extension).toBe('svg');
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it('should render chartjs graph to png', async () => {
    const spec = JSON.stringify({ type: 'bar', data: {} });
    const result = await service.render(GraphEngine.CHART, spec);
    expect(result.mimeType).toBe('image/png');
    expect(result.extension).toBe('png');
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
