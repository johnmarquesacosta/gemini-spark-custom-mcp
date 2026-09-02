import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssetStatus } from '../enums/asset-status.enum';

@Entity('generated_images')
export class GeneratedImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  prompt: string;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.PENDING })
  status: AssetStatus;

  @Column({ type: 'text', nullable: true })
  assetUrl: string | null;

  @Column({ type: 'int', nullable: true })
  wpMediaId: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  generatedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
