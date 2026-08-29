import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import * as jwt from 'jsonwebtoken';

// Único usuário do POC — hardcoded, sem hash, sem validação real
const POC_USER = {
  email: 'johnmarquesacosta@gmail.com',
  password: 'John123$',
};

interface RegisteredClient {
  client_id: string;
  redirect_uris: string[];
}

interface AuthCode {
  client_id: string;
  redirect_uri: string;
  code_challenge?: string;
  expiresAt: number;
}

@Injectable()
export class McpAuthService {
  private clients = new Map<string, RegisteredClient>();
  private codes = new Map<string, AuthCode>();
  private readonly jwtSecret =
    process.env.JWT_SECRET ?? 'poc-secret-troque-depois';

  // DCR — aceita qualquer client que se registrar (RFC 7591 mínimo)
  registerClient(redirect_uris: string[], client_name?: string) {
    const client_id = randomUUID();
    this.clients.set(client_id, { client_id, redirect_uris });

    return {
      client_id,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_secret_expires_at: 0,
      redirect_uris,
      client_name,
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    };
  }

  // Authorize — auto-aprova direto pro POC_USER, sem tela nenhuma
  createAuthorizationCode(params: {
    client_id: string;
    redirect_uri: string;
    code_challenge?: string;
  }) {
    const code = randomUUID();
    this.codes.set(code, {
      client_id: params.client_id,
      redirect_uri: params.redirect_uri,
      code_challenge: params.code_challenge,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    });

    return code;
  }

  exchangeToken(params: {
    code: string;
    code_verifier?: string;
    redirect_uri: string;
  }) {
    const stored = this.codes.get(params.code);
    if (!stored || stored.expiresAt < Date.now()) {
      throw new Error('invalid_grant');
    }

    if (stored.redirect_uri !== params.redirect_uri) {
      throw new Error('invalid_grant');
    }

    // Verificação PKCE (S256) — exigido pelo Gemini
    if (stored.code_challenge) {
      const hash = createHash('sha256')
        .update(params.code_verifier ?? '')
        .digest('base64url');

      if (hash !== stored.code_challenge) {
        throw new Error('invalid_grant');
      }
    }

    this.codes.delete(params.code); // uso único

    const access_token = jwt.sign({ sub: POC_USER.email }, this.jwtSecret, {
      expiresIn: '1h',
    });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }

  verifyToken(token: string) {
    return jwt.verify(token, this.jwtSecret);
  }
}
