import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { PostImageRole } from '../enums/post-image-role.enum';
import { ImageGenerationStatus } from '../enums/post-image-generation-status.enum';

@Entity('post_images')
export class PostImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.images, { onDelete: 'CASCADE' })
  post: Post;

  @Column({ type: 'enum', enum: PostImageRole })
  role: PostImageRole; // featured | inline | thumbnail

  @Column({ type: 'int', default: 0 })
  position: number; // ordem de inserção no corpo (0 = featured, 1..n = inline em ordem)

  // --- O campo pedido: prompt gerado pela LLM, consumido pelo modelo de imagem ---
  @Column({ type: 'text' })
  prompt: string;

  @Column({ length: 100, nullable: true })
  promptModel: string; // qual LLM gerou o prompt (ex: 'gpt-4.1', 'claude-sonnet-4-6') — rastreabilidade

  // --- Resultado da geração ---
  @Column({ type: 'enum', enum: ImageGenerationStatus, default: ImageGenerationStatus.PENDING })
  generationStatus: ImageGenerationStatus;

  @Column({ length: 100, nullable: true })
  generationModel: string; // ex: 'flux-1.1-pro', 'sdxl', 'dall-e-3'

  @Column({ length: 500, nullable: true })
  url: string; // preenchido após a geração/upload

  @Column({ length: 500, nullable: true })
  wordpressMediaUrl: string; // URL final após upload pra Media Library do WP

  @Column({ type: 'int', nullable: true })
  wordpressMediaId: number;

  // --- SEO / acessibilidade da imagem ---
  @Column({ length: 160 })
  altText: string; // 80-140 chars recomendado

  @Column({ length: 200, nullable: true })
  caption: string;

  @Column({ length: 255, nullable: true })
  credit: string; // texto de crédito/fonte (também embutido visualmente na imagem, por decisão sua)

  @Column({ length: 120, nullable: true })
  fileName: string; // nome de arquivo SEO-friendly, ex: 'operacao-policial-recife-agosto-2026.webp'

  @Column({ length: 10, default: 'webp' })
  format: string;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
