import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  Req,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { McpAuthService } from './mcp-auth.service';
import { SyncSecretGuard } from '../users/guards/sync-secret.guard';

@ApiTags('OAuth')
@Controller()
export class McpAuthController {
  private readonly logger = new Logger(McpAuthController.name);

  constructor(private readonly auth: McpAuthService) {}

  @Get('.well-known/oauth-protected-resource')
  @ApiOperation({
    summary: 'OAuth Protected Resource Metadata',
    description: 'Returns metadata about the protected resource.',
  })
  @ApiResponse({ status: 200, description: 'Metadata returned successfully' })
  protectedResource(@Req() req: Request) {
    this.logger.log(
      `[oauth-protected-resource] Request received. Method: ${req.method}`,
    );
    this.logger.debug(
      `[oauth-protected-resource] Headers: ${JSON.stringify(req.headers)}`,
    );
    const base =
      process.env.API_PUBLIC_URL ??
      process.env.SERVER_URL ??
      'http://localhost:3001';
    return {
      resource: `${base}/mcp`,
      authorization_servers: [base],
    };
  }

  @Get('.well-known/oauth-authorization-server')
  @ApiOperation({
    summary: 'OAuth Authorization Server Metadata',
    description:
      'Returns metadata about the authorization server configuration.',
  })
  @ApiResponse({ status: 200, description: 'Metadata returned successfully' })
  authServerMetadata(@Req() req: Request) {
    this.logger.log(
      `[oauth-authorization-server] Request received. Method: ${req.method}`,
    );
    this.logger.debug(
      `[oauth-authorization-server] Headers: ${JSON.stringify(req.headers)}`,
    );
    const base =
      process.env.API_PUBLIC_URL ??
      process.env.SERVER_URL ??
      'http://localhost:3001';
    return {
      issuer: base,
      authorization_endpoint: `${base}/oauth/authorize`,
      token_endpoint: `${base}/oauth/token`,
      registration_endpoint: `${base}/oauth/register`,
      scopes_supported: ['offline_access'],
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: [
        'none',
        'client_secret_post',
        'client_secret_basic',
      ],
    };
  }

  @Post('oauth/register')
  @ApiOperation({
    summary: 'Register OAuth Client',
    description: 'Registers a new client dynamically.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        redirect_uris: { type: 'array', items: { type: 'string' } },
        client_name: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Client registered successfully' })
  register(
    @Body() body: { redirect_uris: string[]; client_name?: string },
    @Req() req: Request,
  ) {
    this.logger.log(`[oauth/register] Request received`);
    this.logger.debug(
      `[oauth/register] Headers: ${JSON.stringify(req.headers)}`,
    );
    this.logger.debug(`[oauth/register] Payload: ${JSON.stringify(body)}`);
    return this.auth.registerClient(body.redirect_uris, body.client_name);
  }

  @Get('oauth/authorize')
  @ApiOperation({
    summary: 'Authorize Client',
    description:
      'Initiates the OAuth authorization flow by redirecting to the frontend consent screen.',
  })
  @ApiQuery({ name: 'client_id', required: true, type: String })
  @ApiQuery({ name: 'redirect_uri', required: true, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'code_challenge', required: true, type: String })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the frontend consent screen',
  })
  authorize(
    @Query('client_id') client_id: string,
    @Query('redirect_uri') redirect_uri: string,
    @Query('state') state: string,
    @Query('code_challenge') code_challenge: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.logger.log(`[oauth/authorize] Request received`);
    this.logger.debug(
      `[oauth/authorize] Headers: ${JSON.stringify(req.headers)}`,
    );
    this.logger.debug(
      `[oauth/authorize] Query: client_id=${client_id}, redirect_uri=${redirect_uri}, state=${state}, code_challenge=${code_challenge}`,
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = new URL('/oauth/authorize', frontendUrl);
    url.searchParams.set('client_id', client_id);
    url.searchParams.set('redirect_uri', redirect_uri);
    url.searchParams.set('code_challenge', code_challenge);
    if (state) url.searchParams.set('state', state);

    this.logger.log(
      `[oauth/authorize] Redirecting to frontend consent: ${url.toString()}`,
    );
    return res.redirect(url.toString());
  }

  @Post('oauth/approve')
  @UseGuards(SyncSecretGuard)
  @ApiOperation({
    summary: 'Approve OAuth Authorization',
    description:
      'Called by the frontend (S2S) to approve the authorization and generate the code.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        client_id: { type: 'string' },
        redirect_uri: { type: 'string' },
        code_challenge: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Authorization code generated' })
  approve(
    @Body()
    body: {
      userId: string;
      client_id: string;
      redirect_uri: string;
      code_challenge?: string;
    },
    @Req() req: Request,
  ) {
    this.logger.log(`[oauth/approve] Request received for user ${body.userId}`);
    const code = this.auth.createAuthorizationCode({
      client_id: body.client_id,
      redirect_uri: body.redirect_uri,
      code_challenge: body.code_challenge,
      userId: body.userId,
    });
    return { code };
  }

  @Post('oauth/token')
  @ApiOperation({
    summary: 'Exchange Token',
    description: 'Exchanges an authorization code for an access token.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        grant_type: { type: 'string' },
        code: { type: 'string' },
        redirect_uri: { type: 'string' },
        code_verifier: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Token exchanged successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or token exchange failed',
  })
  async token(
    @Body()
    body: {
      grant_type: string;
      code: string;
      redirect_uri: string;
      code_verifier?: string;
    },
    @Req() req: Request,
  ) {
    this.logger.log(`[oauth/token] Request received`);
    this.logger.debug(`[oauth/token] Headers: ${JSON.stringify(req.headers)}`);
    this.logger.debug(`[oauth/token] Payload: ${JSON.stringify(body)}`);
    try {
      const result = this.auth.exchangeToken(body);
      this.logger.log(`[oauth/token] Token exchanged successfully`);
      return result;
    } catch (e) {
      this.logger.error(
        `[oauth/token] Token exchange failed: ${(e as Error).message}`,
        (e as Error).stack,
      );
      throw e;
    }
  }
}
