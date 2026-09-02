import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  OneToOne,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PostStatus } from '../enums/post-status.enum';
import { ArticleSchemaType } from '../enums/article-schema-type.enum';
import type { PostBlock } from './post-block.entity';
import { PostSource } from './post-source.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
// import { Site } from '../../sites/entities/site.entity'; // multi-tenant, ver nota no fim

@Entity('posts')
@Index(['slug'], { unique: true }) // slug único globalmente (já que o site não existe ainda)
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Multi-tenant / multi-idioma ---
  @Column()
  userId: string;

  @Column({ length: 5 })
  language: string; // 'pt-BR', 'en-US', 'es-ES' — ISO 639-1 + região

  // --- Conteúdo editorial ---
  @Column({ length: 200 })
  title: string; // H1 / headline (schema.org recomenda <= 110 chars, mas guardamos até 200 e validamos na camada de serviço)

  @Column({ length: 220 })
  slug: string;

  @Column({ type: 'text' })
  excerpt: string; // resumo/dek — usado como fallback de metaDescription/og:description se não houver override

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.GENERATING })
  status: PostStatus;

  @Column({
    type: 'enum',
    enum: ArticleSchemaType,
    default: ArticleSchemaType.BLOG_POSTING,
  })
  schemaType: ArticleSchemaType;

  @Column({ type: 'int', nullable: true })
  wordCount: number; // calculado no service ao salvar, útil pra dashboards/QA (faixa alvo 1000-2000)

  @Column({ type: 'int', nullable: true })
  readingTimeMinutes: number;

  // --- Autoria / publisher (override; padrão vem da config do site) ---
  @Column({ length: 120, nullable: true })
  authorName: string;

  @Column({ length: 255, nullable: true })
  authorUrl: string;

  @Column({ length: 120, nullable: true })
  publisherNameOverride: string;

  @Column({ length: 255, nullable: true })
  publisherLogoUrlOverride: string;

  // --- SEO ---
  @Column({ length: 70 })
  metaTitle: string; // 50-60 chars recomendado, hard cap 70 pra dar folga

  @Column({ length: 170 })
  metaDescription: string; // 150-160 chars recomendado, hard cap 170

  @Column({ length: 100 })
  focusKeyword: string;

  @Column({ type: 'jsonb', default: [] })
  secondaryKeywords: string[];

  @Column({ length: 255, nullable: true })
  canonicalUrl: string;

  // --- Open Graph / Twitter (nullable = herda de metaTitle/metaDescription/imagem featured na apresentação) ---
  @Column({ length: 70, nullable: true })
  ogTitle: string;

  @Column({ length: 200, nullable: true })
  ogDescription: string;

  @Column({ length: 30, default: 'summary_large_image' })
  twitterCardType: string;

  // --- Categorização (mapeia 1:1 pra taxonomias do WordPress) ---
  @ManyToOne(() => Category, { nullable: false })
  category: Category;

  @ManyToMany(() => Tag)
  @JoinTable({ name: 'post_tags' })
  tags: Tag[];

  // --- Relacionamentos ---
  @OneToMany('PostBlock', (block: PostBlock) => block.post, { cascade: true })
  blocks: Relation<PostBlock>[];

  @OneToMany(() => PostSource, (source) => source.post, { cascade: true })
  sources: PostSource[];

  // --- Integração WordPress ---
  @Column({ type: 'int', nullable: true })
  wordpressPostId: number; // preenchido após criar o rascunho via REST API

  @Column({ length: 20, nullable: true })
  wordpressStatus: string; // espelha o status real retornado pelo WP ('draft', 'pending', etc.)

  // --- Datas ---
  @Column({ type: 'timestamptz', nullable: true })
  datePublished: Date; // preenchido só quando status = PUBLISHED

  @Column({ type: 'timestamptz', nullable: true })
  dateModified: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
