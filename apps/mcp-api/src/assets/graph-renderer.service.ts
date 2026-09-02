import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { GraphEngine } from '../posts/enums/graph-engine.enum';

@Injectable()
export class GraphRendererService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GraphRendererService.name);
  private browser: puppeteer.Browser | null = null;
  private chartJSNodeCanvas: ChartJSNodeCanvas;

  async onModuleInit() {
    this.logger.log('Initializing GraphRendererService...');
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.logger.log('Puppeteer browser launched.');
    } catch (err) {
      this.logger.error('Failed to launch Puppeteer browser:', err);
    }

    // Initialize ChartJS Node Canvas (e.g. 800x600 resolution)
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 800,
      height: 600,
      backgroundColour: 'white',
      chartCallback: (ChartJS) => {
        // Here you can register any ChartJS plugins if needed
      },
    });
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async render(
    engine: GraphEngine,
    spec: string,
  ): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
    if (engine === GraphEngine.MERMAID) {
      return this.renderMermaid(spec);
    } else if (engine === GraphEngine.CHART) {
      return this.renderChart(spec);
    }
    throw new Error(`Unsupported graph engine: ${engine}`);
  }

  private async renderMermaid(
    spec: string,
  ): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
    if (!this.browser) {
      throw new Error('Puppeteer browser is not initialized');
    }

    const page = await this.browser.newPage();
    try {
      // Set viewport for a reasonable default size
      await page.setViewport({ width: 1200, height: 800 });

      // Create a simple HTML document that includes mermaid from CDN
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        </head>
        <body>
          <div class="mermaid" id="mermaid-container">
            ${spec}
          </div>
          <script>
            mermaid.initialize({ startOnLoad: true, theme: 'default' });
          </script>
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'load' });

      // Wait for Mermaid to render the SVG
      const svgElement = await page.waitForSelector('#mermaid-container svg');

      if (!svgElement) {
        throw new Error('Failed to render SVG element');
      }

      // We can either return the SVG as a string/buffer, or take a screenshot.
      // Usually Mermaid is best saved as SVG for scalability.
      const svgContent = await page.evaluate((el) => el.outerHTML, svgElement);
      const buffer = Buffer.from(svgContent, 'utf-8');

      return {
        buffer,
        mimeType: 'image/svg+xml',
        extension: 'svg',
      };
    } finally {
      await page.close();
    }
  }

  private async renderChart(
    spec: string,
  ): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
    try {
      // Spec should be a valid Chart.js configuration JSON string
      const config = JSON.parse(spec);

      const buffer = await this.chartJSNodeCanvas.renderToBuffer(config as any);

      return {
        buffer,
        mimeType: 'image/png',
        extension: 'png',
      };
    } catch (err) {
      this.logger.error('Failed to render Chart.js:', err);
      throw new Error(
        `Failed to parse or render Chart.js configuration: ${err.message}`,
        { cause: err },
      );
    }
  }
}
