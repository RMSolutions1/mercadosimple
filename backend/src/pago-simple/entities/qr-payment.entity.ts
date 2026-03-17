import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum QrStatus {
  ACTIVE  = 'active',
  PAID    = 'paid',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export enum QrType {
  COMERCIO    = 'comercio',    // QR permanente del negocio (acepta cualquier monto)
  CAJA        = 'caja',        // QR de caja específica
  SUCURSAL    = 'sucursal',    // QR de sucursal
  PRODUCTO    = 'producto',    // QR con producto y precio fijo
  PRECIO_FIJO = 'precio_fijo', // QR con monto fijo, uso único
  PRECIO_LIBRE= 'precio_libre',// QR con monto libre (el pagador ingresa el valor)
}

@Entity('qr_payments')
export class QrPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ nullable: true })
  payerId: string;

  // ── Datos del comercio ──
  @Column({ nullable: true })
  businessName: string;   // Nombre del comercio / razón social

  @Column({ nullable: true })
  cuit: string;           // CUIT o DNI del titular

  @Column({ nullable: true })
  branchName: string;     // Nombre de la sucursal / caja / local

  @Column({ nullable: true })
  address: string;        // Dirección física del negocio

  @Column({ type: 'enum', enum: QrType, default: QrType.COMERCIO })
  qrType: QrType;

  // ── Datos del cobro ──
  @Column({ nullable: true, type: 'decimal', precision: 12, scale: 2 })
  amount: number;         // null = monto libre

  @Column({ nullable: true })
  description: string;    // Descripción / nombre del producto

  @Column({ nullable: true })
  productName: string;    // Solo para QR tipo producto

  // ── QR data ──
  @Column({ unique: true })
  qrCode: string;

  @Column({ type: 'text', nullable: true })
  qrImageBase64: string;

  @Column({ default: false })
  isPermanent: boolean;   // true = no expira (comercio, caja, sucursal)

  @Column({ type: 'enum', enum: QrStatus, default: QrStatus.ACTIVE })
  status: QrStatus;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ default: 0 })
  scanCount: number;      // Cuántas veces fue escaneado / visualizado

  @Column({ default: 0 })
  paymentCount: number;   // Cuántas veces fue pagado (para QRs permanentes)

  @Column({ nullable: true, type: 'decimal', precision: 12, scale: 2 })
  totalCollected: number; // Total acumulado cobrado por este QR

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
