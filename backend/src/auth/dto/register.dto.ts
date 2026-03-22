import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

/** Registro público: solo comprador o vendedor. El rol admin no se asigna por API (solo seed / panel). */
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn([UserRole.BUYER, UserRole.SELLER], {
    message: 'Rol inválido. Solo se permite buyer o seller',
  })
  role?: UserRole.BUYER | UserRole.SELLER;
}
