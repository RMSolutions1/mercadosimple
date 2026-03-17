import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReceiptStatus {
  PENDING   = 'pending',
  COMPLETED = 'completed',
  REVERSED  = 'reversed',
  FAILED    = 'failed',
}

export enum ReceiptType {
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  REFUND = 'refund',
  QR_PAYMENT = 'qr_payment',
  LINK_PAYMENT = 'link_payment',
}

@Entity('transfer_receipts')
export class TransferReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Número de comprobante rastreable: MS-TRF-YYYYMMDD-XXXXXX */
  @Column({ unique: true })
  receiptNumber: string;

  @Column({ type: 'enum', enum: ReceiptType })
  type: ReceiptType;

  @Column({ type: 'enum', enum: ReceiptStatus, default: ReceiptStatus.COMPLETED })
  status: ReceiptStatus;

  // ── Remitente ───────────────────────────────────────────────────────
  @Column()
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ nullable: true })
  senderCvu: string;

  @Column({ nullable: true })
  senderAlias: string;

  @Column({ nullable: true })
  senderAccountNumber: string;

  // ── Destinatario ────────────────────────────────────────────────────
  @Column({ nullable: true })
  recipientId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column({ nullable: true })
  recipientCvu: string;

  @Column({ nullable: true })
  recipientAlias: string;

  @Column({ nullable: true })
  recipientAccountNumber: string;

  // ── Datos financieros ───────────────────────────────────────────────
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'ARS' })
  currency: string;

  @Column({ nullable: true })
  description: string;

  // ── Balances snapshot ───────────────────────────────────────────────
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  senderBalanceBefore: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  senderBalanceAfter: number;

  // ── Referencias ─────────────────────────────────────────────────────
  @Column({ nullable: true })
  senderTransactionId: string;

  @Column({ nullable: true })
  recipientTransactionId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
