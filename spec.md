# SPEC — nestjs-mcp-api (Fase 1: Controle de Usuários + Autenticação de Agentes)

## 1. Objetivo

Construir, do zero, um monorepo contendo:

- Uma **API NestJS** que expõe rotas **MCP** (Model Context Protocol) via `@rekog/mcp-nest`.
- Um **frontend Next.js** para gerenciar contas de usuário.

O objetivo desta Fase 1 é deixar **pronto o controle de usuários** (cadastro, login, recuperação/troca de senha, refresh/access token) e um **mecanismo de autenticação de agentes de IA** (Gemini e Claude) que vão consumir as rotas MCP. Funcionalidades de negócio da API MCP em si (as tools/rotas que os agentes vão de fato chamar) ficam para uma fase posterior.

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Backend | NestJS + TypeScript |
| Banco de dados | PostgreSQL |
| ORM | TypeORM |
| Autenticação de usuário | JWT (access token) + refresh token persistido no banco |
| E-mail transacional | Resend (recuperação de senha) |
| MCP | `@rekog/mcp-nest` |
| Frontend | Next.js (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Validação | class-validator / class-transformer (API) + zod (frontend) |

## 3. Estrutura do monorepo

```
nestjs-mcp-api/
├── apps/
│   ├── api/                      # NestJS
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/         # login, refresh, logout
│   │       │   ├── users/        # cadastro, perfil, troca de senha
│   │       │   ├── password-reset/
│   │       │   ├── agent-auth/   # autenticação dos agentes de IA (MCP)
│   │       │   └── mcp/          # rotas MCP (placeholder nesta fase)
│   │       ├── common/           # guards, decorators, filters, interceptors
│   │       └── config/
│   └── web/                       # Next.js
│       └── src/
│           ├── app/
│           │   ├── (auth)/
│           │   │   ├── login/
│           │   │   ├── register/
│           │   │   ├── forgot-password/
│           │   │   └── reset-password/
│           │   └── (dashboard)/
│           │       ├── profile/
│           │       └── settings/
│           └── components/
├── packages/
│   ├── shared-types/               # DTOs/tipos compartilhados api <-> web
│   └── config/                     # eslint, tsconfig base
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── AGENTS.md
```

## 4. Modelo de dados (TypeORM entities)

### 4.1 `User`
| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | PK |
| email | string | unique, indexado |
| passwordHash | string | bcrypt/argon2 |
| name | string | |
| emailVerifiedAt | timestamp \| null | |
| createdAt / updatedAt | timestamp | |

### 4.2 `RefreshToken`
| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | PK |
| userId | uuid | FK -> User |
| tokenHash | string | nunca armazenar o token em texto puro |
| revokedAt | timestamp \| null | suporte a logout / rotação |
| expiresAt | timestamp | |
| createdByIp / userAgent | string | opcional, auditoria |
| createdAt | timestamp | |

### 4.3 `PasswordResetToken`
| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | PK |
| userId | uuid | FK -> User |
| tokenHash | string | token enviado por e-mail é hasheado no banco |
| expiresAt | timestamp | ex: 30-60 min |
| usedAt | timestamp \| null | token de uso único |
| createdAt | timestamp | |

### 4.4 `AiAgent`
Representa uma credencial de agente de IA (Gemini, Claude) autorizada a chamar as rotas MCP.

| Campo | Tipo | Observações |
|---|---|---|
| id | uuid | PK |
| name | string | ex: "claude-code-prod", "gemini-agent-1" |
| apiKeyHash | string | a chave em texto puro só é exibida uma vez, na criação |
| ownerId | uuid | FK -> User (dono/criador da credencial) |
| scopes | string[] | permissões/tools que o agente pode acessar |
| lastUsedAt | timestamp \| null | |
| revokedAt | timestamp \| null | |
| createdAt | timestamp | |

## 5. Fluxos de autenticação de usuário

### 5.1 Cadastro (`POST /auth/register`)
- Recebe `email`, `password`, `name`.
- Valida força de senha (mínimo 8 caracteres, 1 número, 1 letra maiúscula).
- Verifica e-mail único.
- Hash da senha (argon2 recomendado, bcrypt aceitável).
- Cria `User`.
- (Opcional nesta fase, mas recomendado) Envia e-mail de verificação via Resend.
- Retorna dados básicos do usuário (sem token — login é separado).

### 5.2 Login (`POST /auth/login`)
- Recebe `email`, `password`.
- Valida credenciais.
- Gera:
  - **Access token** (JWT, curta duração — ex: 15 min), contendo `sub` (userId) e claims mínimas.
  - **Refresh token** (string aleatória opaca, longa duração — ex: 7-30 dias), persistido hasheado em `RefreshToken`.
- Retorna access token no corpo da resposta e refresh token em **cookie httpOnly, secure, sameSite=strict**.

### 5.3 Refresh (`POST /auth/refresh`)
- Lê o refresh token do cookie httpOnly.
- Valida hash contra `RefreshToken` (existe, não expirado, não revogado).
- Implementa **rotação de refresh token**: revoga o token usado e emite um novo (mitiga replay de token roubado).
- Emite novo access token.

### 5.4 Logout (`POST /auth/logout`)
- Revoga o refresh token atual (`revokedAt`).
- Limpa o cookie.

### 5.5 Esqueci minha senha (`POST /auth/forgot-password`)
- Recebe `email`.
- Se o e-mail existir, gera `PasswordResetToken` (token aleatório, hash salvo no banco) e envia e-mail via Resend com link `web/reset-password?token=...`.
- Resposta **sempre genérica** ("se o e-mail existir, você receberá instruções"), para não vazar quais e-mails estão cadastrados.

### 5.6 Redefinir senha (`POST /auth/reset-password`)
- Recebe `token`, `newPassword`.
- Valida token (existe, não expirado, não usado).
- Atualiza `passwordHash` do usuário.
- Marca token como usado.
- Revoga **todos** os refresh tokens ativos do usuário (força novo login em todos os dispositivos).

### 5.7 Trocar senha (autenticado) (`POST /auth/change-password`)
- Requer access token válido.
- Recebe `currentPassword`, `newPassword`.
- Valida senha atual.
- Atualiza hash.
- Revoga refresh tokens ativos (exceto, opcionalmente, a sessão atual).

## 6. Autenticação de agentes de IA (MCP)

Agentes (Gemini, Claude) não usam o fluxo de login de usuário — usam uma **API key** dedicada.

### 6.1 Criação de credencial (`POST /agents`, autenticado como usuário)
- Usuário autenticado cria um `AiAgent` informando `name` e `scopes`.
- Sistema gera uma API key (ex: prefixo `mcp_live_` + string aleatória), retorna **em texto puro apenas nesta resposta** e salva só o hash (`apiKeyHash`) no banco.

### 6.2 Autenticação nas rotas MCP
- As rotas MCP exigem header `Authorization: Bearer <api_key>` (formato distinto do JWT de usuário).
- Guard dedicado (`AgentAuthGuard`):
  - Extrai a key do header.
  - Compara hash contra `AiAgent.apiKeyHash`.
  - Verifica `revokedAt` e (se aplicável) `scopes` compatíveis com a rota chamada.
  - Atualiza `lastUsedAt`.
- Rejeitar com `401` se inválida/revogada.

### 6.3 Revogação (`DELETE /agents/:id`)
- Usuário autenticado revoga a credencial (`revokedAt = now()`), invalidando o acesso do agente imediatamente.

### 6.4 Listagem (`GET /agents`)
- Lista as credenciais do usuário autenticado (sem expor a key, apenas metadados: nome, scopes, criada em, último uso).

## 7. Frontend (Next.js)

Páginas necessárias:

- `/login` — formulário de login.
- `/register` — formulário de cadastro.
- `/forgot-password` — formulário para solicitar recuperação.
- `/reset-password?token=...` — formulário de nova senha.
- `/profile` (autenticado) — dados do usuário + troca de senha.
- `/settings/agents` (autenticado) — CRUD de credenciais de agentes de IA (criar, listar, revogar). A API key gerada deve ser exibida uma única vez com aviso claro de que não poderá ser vista novamente.

Requisitos técnicos:
- Access token mantido em memória (store client-side, ex: contexto React/zustand) — **não** em localStorage.
- Refresh token via cookie httpOnly (o frontend nunca manipula esse valor diretamente).
- Interceptor de requisições que tenta `refresh` automaticamente ao receber `401`.
- Formulários validados com `zod` + `react-hook-form`.
- Componentes de formulário via `shadcn/ui`.

## 8. Segurança — requisitos obrigatórios

- Hash de senha com argon2 (ou bcrypt com custo ≥ 12).
- Rate limiting nas rotas `/auth/login`, `/auth/forgot-password`, `/auth/register` (ex: `@nestjs/throttler`).
- Todos os tokens (refresh, reset de senha, API key de agente) armazenados **hasheados** no banco — nunca em texto puro.
- Resposta genérica em `forgot-password` (não confirmar existência de e-mail).
- CORS restrito ao domínio do frontend.
- Variáveis sensíveis (JWT secret, Resend API key, DB credentials) via `.env`, nunca commitadas.
- Rotação de refresh token a cada uso.

## 9. Fora de escopo (Fase 1)

- Login social (Google/GitHub OAuth).
- Autenticação multifator (2FA).
- As tools/rotas de negócio do MCP em si (apenas a autenticação de agente está nesta fase).
- Painel administrativo multi-tenant.
- Verificação obrigatória de e-mail bloqueando login (pode ficar como TODO).

## 10. Etapas de implementação

1. **Setup do monorepo**: pnpm workspaces + Turborepo, `apps/api` (Nest CLI) e `apps/web` (Next.js), `packages/shared-types`.
2. **Infra da API**: conexão TypeORM + PostgreSQL, configuração de ambiente (`.env`, `ConfigModule`), estrutura de módulos.
3. **Módulo `users`**: entidade `User`, endpoint de cadastro, hash de senha.
4. **Módulo `auth`**: login, geração de access/refresh token, guard JWT, endpoint de refresh (com rotação) e logout.
5. **Módulo `password-reset`**: entidade `PasswordResetToken`, integração com Resend, endpoints forgot/reset password, endpoint change-password (autenticado).
6. **Módulo `agent-auth`**: entidade `AiAgent`, endpoints de criação/listagem/revogação de credenciais, `AgentAuthGuard` para proteger rotas MCP.
7. **Frontend — autenticação**: páginas de login/registro/forgot/reset password, gerenciamento de access token em memória + refresh automático.
8. **Frontend — perfil e agentes**: página de perfil (troca de senha) e página de gerenciamento de credenciais de agentes de IA.
9. **Testes**: cobertura dos fluxos críticos (login, refresh com rotação, reset de senha, guard de agente) — seguindo TDD conforme o skill `solid` já usado no projeto.
10. **Revisão de segurança**: checklist da seção 8 antes de considerar a fase concluída.

## 11. Critério de conclusão da Fase 1

- Um usuário consegue se cadastrar, logar, recuperar senha esquecida, trocar senha autenticado, e permanecer logado via refresh token com rotação, tudo pelo frontend Next.js.
- Um usuário autenticado consegue gerar uma API key, e essa key autentica corretamente uma chamada às rotas MCP (mesmo que as rotas MCP ainda não façam nada de útil nesta fase — o guard já bloqueia/libera corretamente).
- Uma credencial revogada deixa de funcionar imediatamente.
## Gemini Spark Integration
- **Callback Redirect URI**: `https://oauth-redirect.googleusercontent.com/r/user_bound_custom-mcp-100027770923717185730-automobiles-translate-hearts-models_trycloudflare_com`

