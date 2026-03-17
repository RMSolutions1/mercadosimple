import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SettlementStatus {
  PENDING = 'pending',       // Fondos retenidos (T+0)
  PROCESSING = 'processing', // En proceso de liquidación
  SETTLED = 'settled',       // Acreditado en billetera
  FAILED = 'failed',
}

export enum SettlementType {
  SALE = 'sale',             // Venta de producto
  REFUND = 'refund',         // Reembolso al vendedor
  FEE = 'fee',               // Comisión Pago Simple
  ADJUSTMENT = 'adjustment', // Ajuste manual
}

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sellerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  paymentLinkId: string;

  @Column({ type: 'enum', enum: SettlementType })
  type: SettlementType;

  @Column({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.PENDING })
  status: SettlementStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossAmount: number; // Monto bruto

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  feeAmount: number; // Comisión Pago Simple (ej: 3.5%)

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number; // Monto neto (grossAmount - feeAmount)

  @Column({ nullable: true })
  settledAt: Date;

  @Column({ nullable: true })
  scheduledFor: Date; // Fecha programada para acreditación

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
