import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getOrCreateConversation(buyerId: string, sellerId: string, productId?: string) {
    let conversation = await this.conversationRepository.findOne({
      where: { buyerId, sellerId, productId: productId || null },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        buyerId,
        sellerId,
        productId,
      });
      conversation = await this.conversationRepository.save(conversation);
    }

    return this.conversationRepository.findOne({
      where: { id: conversation.id },
      relations: ['buyer', 'seller', 'product', 'messages', 'messages.sender'],
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');

    if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
    });
    await this.messageRepository.save(message);

    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
    });

    return this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });
  }

  async getMyConversations(userId: string) {
    const conversations = await this.conversationRepository.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      relations: ['buyer', 'seller', 'product', 'messages'],
      order: { lastMessageAt: 'DESC' },
    });

    return conversations.map((conv) => ({
      ...conv,
      lastMessage: conv.messages?.[conv.messages.length - 1] || null,
      unreadCount: conv.messages?.filter((m) => !m.isRead && m.senderId !== userId).length || 0,
    }));
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }

    await this.messageRepository.update(
      { conversationId, isRead: false },
      { isRead: true },
    );

    return this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }
}
