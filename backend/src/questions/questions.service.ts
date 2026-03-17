import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question, QuestionStatus } from './entities/question.entity';
import { Product } from '../products/entities/product.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateQuestionDto, AnswerQuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateQuestionDto, asker: User) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
      relations: ['seller'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.sellerId === asker.id) {
      throw new BadRequestException('No podés hacer preguntas sobre tu propio producto');
    }

    const question = this.questionRepository.create({
      productId: dto.productId,
      askerId: asker.id,
      question: dto.question,
      status: QuestionStatus.UNANSWERED,
      isPublic: false,
    });

    return this.questionRepository.save(question);
  }

  async answerQuestion(id: string, dto: AnswerQuestionDto, answerer: User) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!question) throw new NotFoundException('Pregunta no encontrada');

    if (answerer.role !== UserRole.ADMIN && question.product?.sellerId !== answerer.id) {
      throw new ForbiddenException('Solo el vendedor puede responder esta pregunta');
    }

    question.answer = dto.answer;
    question.answererId = answerer.id;
    question.answeredAt = new Date();
    question.status = QuestionStatus.ANSWERED;
    question.isPublic = dto.isPublic !== undefined ? dto.isPublic : true;

    return this.questionRepository.save(question);
  }

  async getProductQuestions(productId: string, includeUnanswered = false) {
    const where: any = { productId, isPublic: true, status: QuestionStatus.ANSWERED };
    if (includeUnanswered) {
      delete where.isPublic;
      delete where.status;
    }

    return this.questionRepository.find({
      where: includeUnanswered ? { productId } : where,
      relations: ['asker', 'answerer'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getSellerQuestions(sellerId: string, page = 1, limit = 20) {
    const [questions, total] = await this.questionRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.product', 'product')
      .leftJoinAndSelect('q.asker', 'asker')
      .where('product.sellerId = :sellerId', { sellerId })
      .andWhere('q.status = :status', { status: QuestionStatus.UNANSWERED })
      .orderBy('q.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { questions, total, page, totalPages: Math.ceil(total / limit) };
  }

  async deleteQuestion(id: string, user: User) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!question) throw new NotFoundException('Pregunta no encontrada');
    if (user.role !== UserRole.ADMIN && question.askerId !== user.id && question.product?.sellerId !== user.id) {
      throw new ForbiddenException('Sin permisos para eliminar');
    }
    question.status = QuestionStatus.DELETED;
    await this.questionRepository.save(question);
    return { message: 'Pregunta eliminada' };
  }
}
