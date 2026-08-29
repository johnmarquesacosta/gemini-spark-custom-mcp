import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { McpAuthGuard } from '../mcp-auth/mcp-auth.guard';
import { McpResourcesService } from './mcp-resources.service';

@ApiTags('MCP Resources')
@ApiBearerAuth()
@Controller()
export class McpResourcesController {
  private readonly logger = new Logger(McpResourcesController.name);

  constructor(private readonly resourcesService: McpResourcesService) {}

  @Get('mcp')
  @UseGuards(McpAuthGuard)
  @ApiOperation({
    summary: 'MCP Server-Sent Events Endpoint',
    description:
      'Establishes an SSE connection for MCP protocol messages. Requires OAuth Bearer token.',
  })
  @ApiResponse({ status: 200, description: 'SSE connection established' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  mcp(@Req() req: Request, @Res() res: Response) {
    this.logger.log(
      `[mcp] Request received. Method: ${req.method}, URL: ${req.url}`,
    );

    // Configura os headers corretos para Server-Sent Events
    res.set('Content-Type', 'text/event-stream');
    res.set('Cache-Control', 'no-cache');
    res.set('Connection', 'keep-alive');

    // Envia o evento inicial exigido pelo protocolo MCP
    const base =
      process.env.API_PUBLIC_URL ??
      process.env.SERVER_URL ??
      'http://localhost:3001';
    const endpointUrl = `${base}/mcp/messages`;

    res.write(`event: endpoint\n`);
    res.write(`data: ${endpointUrl}\n\n`);

    // Mantém a conexão aberta
    const interval = setInterval(() => {
      res.write(`:\n\n`); // Ping para manter a conexão viva
    }, 15000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  }

  @Post('mcp')
  @UseGuards(McpAuthGuard)
  @ApiOperation({
    summary: 'MCP JSON-RPC Endpoint',
    description:
      'Handles incoming JSON-RPC 2.0 requests for the MCP protocol. Requires OAuth Bearer token.',
  })
  @ApiBody({ schema: { type: 'object', description: 'JSON-RPC 2.0 Request' } })
  @ApiResponse({ status: 200, description: 'JSON-RPC response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async handleMcpPost(@Req() req: Request, @Res() res: Response) {
    this.logger.log(
      `[mcp] POST Request received. Body: ${JSON.stringify(req.body)}`,
    );

    const rpcRequest = req.body;

    // Se for uma notificação (sem id), apenas retorne 200 OK
    if (rpcRequest && typeof rpcRequest.id === 'undefined') {
      return res.status(200).send();
    }

    const userId = (req as any).user?.sub;
    const result = await this.resourcesService.handleRpcRequest(
      userId,
      rpcRequest,
    );

    return res.json({
      jsonrpc: '2.0',
      id: rpcRequest.id,
      result,
    });
  }
}
