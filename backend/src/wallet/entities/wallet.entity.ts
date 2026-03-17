import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 'ARS' })
  currency: string;

  // ── Identidad bancaria ──────────────────────────────────────────────
  /** CVU de 22 dígitos único por usuario */
  @Column({ unique: true, nullable: true })
  cvu: string;

  /** Alias tipo mercadopago: palabra.palabra.palabra */
  @Column({ unique: true, nullable: true })
  alias: string;

  /** Número de cuenta para mostrar en extractos (MS-XXXXXX) */
  @Column({ unique: true, nullable: true })
  accountNumber: string;

  // ── Estado ─────────────────────────────────────────────────────────
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFrozen: boolean;

  @Column({ nullable: true })
  frozenReason: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  frozenBalance: number;

  @OneToMany(() => WalletTransaction, (tx) => tx.wallet)
  transactions: WalletTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
