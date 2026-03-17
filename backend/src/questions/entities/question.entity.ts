import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  OneToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum QuestionStatus {
  UNANSWERED = 'unanswered',
  ANSWERED = 'answered',
  DELETED = 'deleted',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  askerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'askerId' })
  asker: User;

  @Column('text')
  question: string;

  @Column('text', { nullable: true })
  answer: string;

  @Column({ nullable: true })
  answeredAt: Date;

  @Column({ nullable: true })
  answererId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'answererId' })
  answerer: User;

  @Column({ type: 'enum', enum: QuestionStatus, default: QuestionStatus.UNANSWERED })
  status: QuestionStatus;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
