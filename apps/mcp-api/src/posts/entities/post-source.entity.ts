import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

@Entity('post_sources')
export class PostSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.sources, { onDelete: 'CASCADE' })
  post: Post;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 500 })
  url: string;

  @Column({ type: 'int', default: 0 })
  position: number;
}
