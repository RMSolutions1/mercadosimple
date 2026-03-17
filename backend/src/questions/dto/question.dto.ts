import { IsString, IsUUID, MaxLength, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateQuestionDto {
  @IsUUID()
  productId: string;

  @IsString()
  @MinLength(10, { message: 'La pregunta debe tener al menos 10 caracteres' })
  @MaxLength(2500, { message: 'La pregunta no puede superar 2500 caracteres' })
  question: string;
}

export class AnswerQuestionDto {
  @IsString()
  @MinLength(5, { message: 'La respuesta debe tener al menos 5 caracteres' })
  @MaxLength(2500, { message: 'La respuesta no puede superar 2500 caracteres' })
  answer: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
