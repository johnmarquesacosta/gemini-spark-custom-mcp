# PRD — Sistema de Posts em Blocos (Texto / Imagem / Gráfico)

**Projeto:** Rede de blogs alimentados por IA
**Repositório:** `gemini-spark-custom-mcp` (monorepo `apps/api` NestJS + `apps/web` Next.js)
**Status:** Proposto
**Autor:** John (com apoio de Claude)

---

## 1. Contexto

O mecanismo atual de criação de posts (agente LLM → ferramenta MCP → WordPress via REST, sempre como rascunho) já está funcionando para texto puro. Dois problemas motivam esta mudança:

1. **Gráficos/diagramas:** a tentativa de usar Mermaid direto no WordPress não funciona — o editor do WP sanitiza `<script>`, então o código Mermaid nunca é renderizado no client. Hoje, quando o conteúdo precisa de um gráfico, o agente cai para arte ASCII em texto puro, que fica esteticamente ruim e não é responsiva.
2. **Posicionamento de imagens:** o modelo atual assume no máximo uma imagem no corpo + uma thumbnail, mas o conteúdo real frequentemente pede múltiplas imagens em pontos específicos do texto, e hoje não existe uma forma estruturada de decidir *onde* cada imagem entra na montagem final.

Foi avaliado abandonar o WordPress em favor de um blog público em Next.js (já que a stack NestJS+Next.js existe), mas a decisão foi **manter o WordPress** — reconstruir SEO técnico, AdSense e o editor de revisão do zero custaria mais do que vale a pena neste momento.

## 2. Objetivo

Permitir que o agente LLM gere posts com uma **sequência arbitrária e ordenada de blocos** (texto, imagem, gráfico), onde cada bloco não-textual é renderizado/gerado de forma determinística e assíncrona, armazenado no MinIO, e só entra em contato com o WordPress no momento explícito de publish.

## 3. Não-objetivos

- Não inclui migrar a publicação para fora do WordPress.
- Não inclui automatizar a publicação final (a regra de "nunca publica automaticamente, sempre rascunho manual" continua valendo).
- Não inclui um editor de rich-text completo no painel admin — a edição é por bloco (texto, prompt de imagem, spec de gráfico), não um WYSIWYG geral.
- Não inclui suporte a outros CMS além do WordPress nesta fase.

## 4. Usuários

Uso interno, um único operador (John) via painel de administração web (`apps/web`), que revisa e aprova cada post antes do envio ao WordPress.

## 5. Visão geral do fluxo

O pipeline de geração/renderização **nunca interage com o WordPress** — todo asset gerado vive no MinIO até o momento explícito de publish. O WP só entra na jogada quando o operador aciona "postar".

```
LLM gera Post + PostBlock[] (ordem definida pelo LLM)
        │
        ├─ bloco TEXTO      → conteúdo já pronto, sem processamento
        ├─ bloco IMAGEM     → cria GeneratedImage (prompt, status=PENDING)
        └─ bloco GRAFICO    → cria RenderedGraph (engine + spec, status=PENDING)
        │
        ▼
Worker assíncrono processa os PENDING — 100% in-process, sem CLI externo
        ├─ RenderedGraph(engine=MERMAID) → Puppeteer embutido (provider Nest)  → SVG
        ├─ RenderedGraph(engine=CHART)   → chartjs-node-canvas (in-process)    → PNG
        └─ GeneratedImage                → automação de imagem existente
        │
        ▼
Assets sobem para o MinIO (assetUrl); wpMediaId permanece NULL nesta etapa
        │
        ▼
Post.status recalculado:
        - algum bloco FAILED         → NEEDS_REVIEW (bloqueia publish)
        - todos os blocos READY      → READY_TO_PUBLISH
        │
        ▼
Painel admin: revisão, edição de blocos, re-render sob demanda (sempre contra o MinIO)
        │
        ▼
Ação "postar" (manual) → status=PUBLISHING
        ├─ baixa cada asset (featured image + blocos IMAGE/GRAPH) do MinIO
        ├─ sobe cada um pra media library do WP → grava wpMediaId
        ├─ monta HTML final na ordem dos blocos, usando as URLs do WP
        └─ cria o post via WordPress REST API (sempre draft) → status=PUBLISHED
              (falha em qualquer passo → status=PUBLISH_FAILED, MinIO intacto, pode retentar)
```

## 6. Requisitos funcionais

### 6.1 Geração de estrutura (agente/MCP)
- RF01: A ferramenta MCP de criação de post deve aceitar uma lista ordenada de blocos, cada um com `type` (`text` | `image` | `graph`) e o payload correspondente.
- RF02: Para blocos `image`, o payload é um `prompt` de texto (geração de imagem continua em fluxo separado da geração do texto, como já decidido).
- RF03: Para blocos `graph`, o LLM define explicitamente o `engine` (`mermaid` para diagramas, `chart` para gráficos de dados como pizza/barra/linha) — sem inferência automática — mais a `spec` bruta (código Mermaid ou config de chart).
- RF04: A imagem de destaque (thumbnail) é sempre gerada em um fluxo separado, fora da sequência de blocos, e associada ao post via relação 1:1.
- RF05: A ordem dos blocos é explícita (campo `order`) e arbitrária — sem limite fixo de quantidade ou de tipos por post.

### 6.2 Renderização e geração de assets
- RF06: Um worker/serviço deve processar blocos `graph` com `status=PENDING`, chamando o motor de renderização correspondente ao `engine`. **Este worker nunca interage com o WordPress.**
- RF07: Diagramas (`engine=mermaid`) são renderizados in-process, via Puppeteer embutido como dependência da própria API NestJS (sem shell-exec de CLI externo, sem container/microserviço adicional) — mantendo uma instância de browser aquecida (singleton/pool) em vez de abrir um Chromium por render.
- RF08: Gráficos de dados (`engine=chart`) são renderizados in-process via `chartjs-node-canvas` (binding nativo, sem browser, sem CLI, sem microserviço externo).
- RF09: Blocos `image` com `status=PENDING` disparam a automação de geração de imagem já existente, usando o `prompt` do bloco.
- RF10: Todo asset renderizado/gerado é enviado **exclusivamente para o MinIO** (`assetUrl` = URL no MinIO). `wpMediaId` permanece `NULL` nesta fase — nada é enviado ao WordPress até a ação de publish.
- RF11: Falhas de renderização/geração marcam o bloco como `FAILED` com uma mensagem de erro persistida — sem retry automático e sem fallback com placeholder.

### 6.3 Painel de administração (`apps/web`)
- RF12: Deve ser possível visualizar um post com todos os seus blocos, na ordem, incluindo preview do asset renderizado (ou o erro, se `FAILED`).
- RF13: Deve ser possível editar o conteúdo de um bloco: texto (`textContent`), prompt de imagem, ou spec de gráfico.
- RF14: Ao salvar a edição de um bloco `image` ou `graph`, o sistema deve resetar seu `status` para `PENDING` e disparar o re-processamento automaticamente.
- RF15: O painel deve exibir o status agregado do post (`generating` / `rendering` / `needs_review` / `ready` / `publishing` / `publish_failed` / `published`) e bloquear a ação de publicar enquanto houver blocos `FAILED`.

### 6.4 Publicação
- RF16: A ação "postar" (manual, disparada pelo operador no painel) é o único ponto de todo o sistema que fala com o WordPress. Ela move `Post.status` para `PUBLISHING`.
- RF17: Para cada asset do post (featured image + blocos `image`/`graph` já `READY`), o sistema baixa o arquivo do MinIO e sobe pra media library do WP via REST, persistindo o `wpMediaId` retornado (evita re-upload em retentativas).
- RF18: A montagem do HTML final percorre os blocos em ordem: `text` vira parágrafo/HTML direto; `image` e `graph` viram `<figure><img></figure>` apontando para a URL do WP (não a do MinIO) — garante featured image nativa, `srcset` responsivo e backup padrão do WP no post final.
- RF19: O envio do post ao WordPress continua usando o mecanismo REST já existente, sempre com `status=draft` — nenhuma alteração nessa regra.
- RF20: Se qualquer etapa do publish falhar (upload de asset ou criação do post), `Post.status` vai para `PUBLISH_FAILED` com o erro persistido; os assets no MinIO permanecem intactos e a ação pode ser retentada sem reprocessar geração/renderização.
- RF21: Após publish bem-sucedido, `wordpressPostId` é persistido no `Post` e `status` muda para `PUBLISHED`.

## 7. Requisitos não-funcionais

- RNF01: O motor de automação deve continuar agnóstico de nicho/idioma (parametrizado por site), conforme decisão já tomada para a rede de blogs.
- RNF02: Renderização de gráficos deve produzir assets responsivos (SVG preferencialmente para diagramas) — sem largura fixa tipo ASCII art.
- RNF03: A renderização (Puppeteer/chartjs-node-canvas) deve ficar isolada num módulo próprio dentro da API, para permitir extrair pra um worker separado no futuro sem mudar a interface caso vire gargalo de recursos.
- RNF04: Toda a modelagem deve suportar múltiplos sites/tenants (campo `siteId` em `Post`).

## 8. Modelo de dados

```typescript
// ============================================================================
// Modelagem: sistema de posts em blocos (TEXTO / IMAGEM / GRAFICO)
// ----------------------------------------------------------------------------
// Ideia central: IMAGEM e GRAFICO compartilham o mesmo ciclo de vida —
//   spec/prompt (input) -> render/geração assíncrona -> asset final (output)
//   -> pode falhar -> editável no admin -> re-render ao salvar.
// Por isso ambos usam entidades separadas e reutilizáveis (GeneratedImage,
// RenderedGraph), em vez de campos soltos dentro de PostBlock.
// A thumbnail (featured image) usa a MESMA GeneratedImage, mas fora da
// sequência de blocos — é um relacionamento 1:1 direto no Post.
//
// Armazenamento: TODO asset gerado/renderizado vai pro MinIO primeiro
// (assetUrl = URL no MinIO). O pipeline de geração/renderização NUNCA
// interage com o WordPress. Só na ação de publish ("postar") o sistema
// baixa cada asset do MinIO e sobe pra media library do WP (populando
// wpMediaId), garantindo featured image nativa, srcset responsivo e
// backup padrão do WP no post final.
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum PostBlockType {
  TEXT = 'text',
  IMAGE = 'image',
  GRAPH = 'graph',
}

export enum GraphEngine {
  MERMAID = 'mermaid', // diagramas: fluxograma, arquitetura, timeline — renderizado via Puppeteer in-process
  CHART = 'chart',     // gráficos de dados: pizza, barra, linha — renderizado via chartjs-node-canvas in-process
}

// Status compartilhado por GeneratedImage e RenderedGraph.
// PENDING     -> acabou de ser criado pelo LLM, aguardando processamento
// PROCESSING  -> worker pegou o job e está gerando/renderizando
// READY       -> asset final disponível no MinIO (assetUrl preenchido)
// FAILED      -> falhou; errorMessage preenchido; fica visível no admin
export enum AssetStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

// Status do Post como um todo — deriva do status agregado dos blocos,
// mas é persistido para não recalcular toda hora.
export enum PostStatus {
  GENERATING = 'generating',           // LLM ainda gerando estrutura/blocos
  RENDERING = 'rendering',             // blocos sendo processados (imagens/gráficos) — tudo no MinIO
  NEEDS_REVIEW = 'needs_review',       // pelo menos 1 bloco em FAILED — precisa de ação no admin
  READY_TO_PUBLISH = 'ready',          // todos os blocos + thumbnail estão READY no MinIO
  PUBLISHING = 'publishing',           // ação "postar" disparada: subindo assets MinIO -> WP media + criando o post
  PUBLISH_FAILED = 'publish_failed',   // falhou ao subir pro WP (ex: WP fora do ar) — asset no MinIO continua intacto, pode tentar de novo
  PUBLISHED = 'published',             // post criado no WP como rascunho, todos os assets já na media library
}

// ---------------------------------------------------------------------------
// GeneratedImage — usado tanto pela thumbnail (Post.featuredImage)
// quanto por blocos do tipo IMAGE (PostBlock.generatedImage)
// ---------------------------------------------------------------------------

@Entity('generated_images')
export class GeneratedImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Prompt gerado pelo LLM (fluxo de geração de imagem, já separado do texto)
  @Column('text')
  prompt: string;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.PENDING })
  status: AssetStatus;

  // URL final do asset já hospedado no MinIO (source of truth da geração —
  // o worker de geração de imagem nunca fala com o WP)
  @Column({ type: 'text', nullable: true })
  assetUrl: string | null;

  // ID do media item no WordPress. Fica NULL durante toda a geração/edição.
  // Só é preenchido no momento do publish, quando o sistema baixa o asset
  // do MinIO e sobe pra media library do WP. Cacheado aqui pra não re-subir
  // em republish/retry.
  @Column({ type: 'int', nullable: true })
  wpMediaId: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  generatedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// RenderedGraph — usado por blocos do tipo GRAPH
// ---------------------------------------------------------------------------

@Entity('rendered_graphs')
export class RenderedGraph {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Definido explicitamente pelo LLM — sem inferência automática
  @Column({ type: 'enum', enum: GraphEngine })
  engine: GraphEngine;

  // Spec bruta gerada pelo LLM (código Mermaid, ou config JSON do Chart).
  // É o "source of truth" editável no admin — ao editar, dispara re-render.
  @Column('text')
  spec: string;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.PENDING })
  status: AssetStatus;

  @Column({ type: 'text', nullable: true })
  assetUrl: string | null; // SVG (mermaid) ou PNG (chart) hospedado no MinIO

  // Preenchido só no publish (upload MinIO -> WP media library), igual
  // GeneratedImage.wpMediaId — nunca durante a renderização em si.
  @Column({ type: 'int', nullable: true })
  wpMediaId: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  renderedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// PostBlock — unidade da sequência ordenada (TEXTO | IMAGEM | GRAFICO)
// ---------------------------------------------------------------------------

@Entity('post_blocks')
@Index(['postId', 'order'])
export class PostBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @ManyToOne(() => Post, (post) => post.blocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  // Posição do bloco dentro do post — define a ordem de montagem final
  @Column('int')
  order: number;

  @Column({ type: 'enum', enum: PostBlockType })
  type: PostBlockType;

  // Preenchido só quando type = TEXT. Markdown ou HTML já pronto do LLM —
  // não precisa de processamento assíncrono, então não tem "status" próprio.
  @Column({ type: 'text', nullable: true })
  textContent: string | null;

  // Preenchido só quando type = IMAGE
  @Column({ type: 'uuid', nullable: true })
  generatedImageId: string | null;

  @OneToOne(() => GeneratedImage, { nullable: true, cascade: true, eager: true })
  @JoinColumn({ name: 'generatedImageId' })
  generatedImage: GeneratedImage | null;

  // Preenchido só quando type = GRAPH
  @Column({ type: 'uuid', nullable: true })
  renderedGraphId: string | null;

  @OneToOne(() => RenderedGraph, { nullable: true, cascade: true, eager: true })
  @JoinColumn({ name: 'renderedGraphId' })
  renderedGraph: RenderedGraph | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Post
// ---------------------------------------------------------------------------

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenant: qual site/blog da rede este post pertence
  @Column('uuid')
  siteId: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  language: string; // ex: 'pt-BR', 'en-US'

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.GENERATING })
  status: PostStatus;

  // Thumbnail — sempre gerada separadamente, fora da sequência de blocos
  @Column({ type: 'uuid', nullable: true })
  featuredImageId: string | null;

  @OneToOne(() => GeneratedImage, { nullable: true, cascade: true, eager: true })
  @JoinColumn({ name: 'featuredImageId' })
  featuredImage: GeneratedImage | null;

  @OneToMany(() => PostBlock, (block) => block.post, { cascade: true })
  blocks: PostBlock[];

  // Preenchido após o publish bem-sucedido no WordPress
  @Column({ type: 'int', nullable: true })
  wordpressPostId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 9. Máquina de estados

**`AssetStatus`** (`GeneratedImage`, `RenderedGraph`): `PENDING → PROCESSING → READY | FAILED`. De `FAILED`, uma edição salva no admin volta o status para `PENDING`. Todo o ciclo acontece contra o MinIO — nunca toca o WP.

**`PostStatus`**: `GENERATING → RENDERING → (NEEDS_REVIEW | READY_TO_PUBLISH) → PUBLISHING → (PUBLISH_FAILED | PUBLISHED)`. `NEEDS_REVIEW` é reavaliado a cada mudança de status de um bloco filho; some assim que o último bloco `FAILED` for corrigido e voltar a `READY`. `PUBLISHING`/`PUBLISH_FAILED` isolam a etapa de upload-pro-WP como uma operação própria, que pode ser retentada sem repetir geração — de `PUBLISH_FAILED`, o operador pode simplesmente clicar "postar" de novo.

## 10. Fora de escopo / riscos conhecidos

- Puppeteer embutido na API traz Chromium como dependência (~300MB, uso de memória por render) — validar footprint/latência e considerar mover pra um worker/processo isolado se virar gargalo (sem mudar a interface externa).
- `chartjs-node-canvas` depende de bindings nativos de `canvas` — validar build/compatibilidade no ambiente de deploy (Docker) antes de produção.
- Sem versionamento de asset (re-render sobrescreve `assetUrl`/`wpMediaId` anterior) — se precisar de histórico, é uma extensão futura.
- Se o WP estiver fora do ar no momento do publish, o post fica em `PUBLISH_FAILED` indefinidamente até nova tentativa manual — sem retry automático nesta fase.

## 11. Critérios de aceite (MVP)

- [ ] Um post com blocos `text`, `image` e `graph` (ambos engines) é gerado e processado até `READY_TO_PUBLISH` sem qualquer chamada ao WordPress durante o processo.
- [ ] Um bloco `graph` com spec inválida cai em `FAILED` com mensagem de erro visível no admin, sem afetar o MinIO dos demais blocos.
- [ ] Editar e salvar a spec de um bloco `FAILED` no admin dispara novo render (contra o MinIO) e, em caso de sucesso, o post sai de `NEEDS_REVIEW`.
- [ ] Acionar "postar" sobe todos os assets do MinIO pra media library do WP, cria o post como rascunho preservando a ordem exata dos blocos, e usa a thumbnail correta como featured image nativa.
- [ ] Uma falha durante o publish (ex: WP indisponível) deixa o post em `PUBLISH_FAILED` sem perder nenhum asset do MinIO, e uma nova tentativa de "postar" reaproveita o que já foi enviado (sem re-upload de assets já com `wpMediaId`).
- [ ] Nenhum post é publicado automaticamente — o botão "postar" é sempre uma ação manual no admin.