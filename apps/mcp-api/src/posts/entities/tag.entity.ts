import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('tags')
@Index(['slug'], { unique: true })
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 120 })
  slug: string;

  @Column({ type: 'int', nullable: true })
  wordpressTagId: number;
}
