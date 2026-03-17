import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PaymentLinkStatus {
  ACTIVE = 'active',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum PaymentLinkType {
  SINGLE = 'single',       // Pago único
  REUSABLE = 'reusable',   // Link reutilizable (ej: para tienda)
  SUBSCRIPTION = 'subscription', // Suscripción
}

@Entity('payment_links')
export class PaymentLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // Short code for URL: e.g. PS-ABC123

  @Column()
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ nullable: true })
  payerId: string; // Who paid (if paid)

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'ARS' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentLinkStatus, default: PaymentLinkStatus.ACTIVE })
  status: PaymentLinkStatus;

  @Column({ type: 'enum', enum: PaymentLinkType, default: PaymentLinkType.SINGLE })
  type: PaymentLinkType;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  reference: string; // External reference for tracking

  @Column({ default: 0 })
  maxInstallments: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  successRedirect: string;

  @Column({ default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
