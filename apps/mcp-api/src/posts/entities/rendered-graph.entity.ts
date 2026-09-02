import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GraphEngine } from '../enums/graph-engine.enum';
import { AssetStatus } from '../enums/asset-status.enum';

@Entity('rendered_graphs')
export class RenderedGraph {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: GraphEngine })
  engine: GraphEngine;

  @Column('text')
  spec: string;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.PENDING })
  status: AssetStatus;

  @Column({ type: 'text', nullable: true })
  assetUrl: string | null;

  @Column({ type: 'int', nullable: true })
  wpMediaId: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  renderedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
