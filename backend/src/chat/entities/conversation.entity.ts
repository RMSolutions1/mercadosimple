import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buyerId: string;

  @ManyToOne(() => User, (user) => user.buyerConversations)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column()
  sellerId: string;

  @ManyToOne(() => User, (user) => user.sellerConversations)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, (product) => product.conversations, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @OneToMany(() => Message, (message) => message.conversation, { cascade: true })
  messages: Message[];

  @Column({ nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
