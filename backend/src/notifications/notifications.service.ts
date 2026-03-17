import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
    imageUrl?: string;
    metadata?: Record<string, any>;
  }) {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unreadCount = await this.notificationRepository.count({ where: { userId, isRead: false } });
    return { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepository.update({ id, userId }, { isRead: true });
    return { message: 'Notificación marcada como leída' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }

  async deleteNotification(id: string, userId: string) {
    await this.notificationRepository.delete({ id, userId });
    return { message: 'Notificación eliminada' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({ where: { userId, isRead: false } });
    return { count };
  }
}
