export enum PostStatus {
  GENERATING = 'generating', // LLM ainda gerando estrutura/blocos
  RENDERING = 'rendering', // blocos sendo processados (imagens/gráficos) — tudo no MinIO
  NEEDS_REVIEW = 'needs_review', // pelo menos 1 bloco em FAILED — precisa de ação no admin
  READY_TO_PUBLISH = 'ready', // todos os blocos + thumbnail estão READY no MinIO
  PUBLISHING = 'publishing', // ação "postar" disparada: subindo assets MinIO -> WP media + criando o post
  PUBLISH_FAILED = 'publish_failed', // falhou ao subir pro WP (ex: WP fora do ar) — asset no MinIO continua intacto, pode tentar de novo
  PUBLISHED = 'published', // post criado no WP como rascunho, todos os assets já na media library
  ARCHIVED = 'archived', // mantendo apenas caso exista uso legado/arquivamento futuro
  DRAFT = 'draft', // [LEGADO] Status mantido para não quebrar o synchronize com dados antigos do banco
}
