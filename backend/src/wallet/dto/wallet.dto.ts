import { IsNumber, IsPositive, IsString, IsOptional, IsEmail, IsNotEmpty, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class DepositDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(100, { message: 'El monto mínimo para cargar saldo es $100' })
  @Max(500000, { message: 'El monto máximo para cargar saldo es $500.000' })
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class WithdrawDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(100, { message: 'El monto mínimo para retirar es $100' })
  amount: number;

  @IsOptional()
  @IsString()
  @Length(22, 22, { message: 'El CBU debe tener exactamente 22 dígitos' })
  bankAccountCbu?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class PayWithWalletDto {
  @IsString()
  orderId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}

export class TransferDto {
  /** Puede ser email, CVU (22 dígitos), alias (palabra.palabra.palabra) o MS-XXXXXXX */
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientQuery?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(10, { message: 'El monto mínimo de transferencia es $10' })
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
