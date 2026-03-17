import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum([UserRole.BUYER, UserRole.SELLER], { message: 'Rol inválido. Solo se permite buyer o seller' })
  role?: UserRole.BUYER | UserRole.SELLER;
}
