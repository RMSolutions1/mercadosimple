import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsUrl,
  Min,
  Max,
  MaxLength,
  MinLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCondition } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1, { message: 'El precio mínimo es $1' })
  @Max(99999999, { message: 'El precio máximo es $99.999.999' })
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(99999999)
  originalPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(999999, { message: 'El stock máximo es 999.999 unidades' })
  stock: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Máximo 10 imágenes por producto' })
  @IsUrl({}, { each: true, message: 'Cada imagen debe ser una URL válida' })
  images?: string[];

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @IsUUID('4', { message: 'La categoría debe ser un UUID válido' })
  categoryId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
}
