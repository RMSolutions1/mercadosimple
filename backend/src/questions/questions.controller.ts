import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, AnswerQuestionDto } from './dto/question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Preguntas y Respuestas')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hacer una pregunta sobre un producto' })
  create(@Body() dto: CreateQuestionDto, @CurrentUser() user: User) {
    return this.questionsService.create(dto, user);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Preguntas públicas de un producto' })
  getProductQuestions(@Param('productId') productId: string) {
    return this.questionsService.getProductQuestions(productId);
  }

  @Get('seller')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preguntas sin responder del vendedor' })
  getSellerQuestions(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.questionsService.getSellerQuestions(user.id, +page, +limit);
  }

  @Patch(':id/answer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Responder una pregunta (vendedor)' })
  answer(@Param('id') id: string, @Body() dto: AnswerQuestionDto, @CurrentUser() user: User) {
    return this.questionsService.answerQuestion(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar pregunta' })
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.questionsService.deleteQuestion(id, user);
  }
}
