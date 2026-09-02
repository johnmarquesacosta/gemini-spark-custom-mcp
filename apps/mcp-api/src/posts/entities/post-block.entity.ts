import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PostBlockType } from '../enums/post-block-type.enum';
import type { Post } from './post.entity';
import { GeneratedImage } from './generated-image.entity';
import { RenderedGraph } from './rendered-graph.entity';

@Entity('post_blocks')
@Index(['postId', 'order'])
export class PostBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @ManyToOne('Post', (post: Post) => post.blocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Relation<Post>;

  @Column('int')
  order: number;

  @Column({ type: 'enum', enum: PostBlockType })
  type: PostBlockType;

  @Column({ type: 'text', nullable: true })
  textContent: string | null;

  @Column({ type: 'uuid', nullable: true })
  generatedImageId: string | null;

  @OneToOne(() => GeneratedImage, {
    nullable: true,
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'generatedImageId' })
  generatedImage: GeneratedImage | null;

  @Column({ type: 'uuid', nullable: true })
  renderedGraphId: string | null;

  @OneToOne(() => RenderedGraph, { nullable: true, cascade: true, eager: true })
  @JoinColumn({ name: 'renderedGraphId' })
  renderedGraph: RenderedGraph | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
