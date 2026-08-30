import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('categories')
@Index(['slug', 'userId'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 120 })
  slug: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'int', nullable: true })
  wordpressCategoryId: number; // mapeia pra taxonomia real no WP, usado na busca de posts relacionados via REST API
}
