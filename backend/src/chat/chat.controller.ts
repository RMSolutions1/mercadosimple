import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { IsString, IsOptional } from 'class-validator';

class StartConversationDto {
  @IsString()
  sellerId: string;

  @IsOptional()
  @IsString()
  productId?: string;
}

class SendMessageDto {
  @IsString()
  content: string;
}

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Mis conversaciones' })
  getMyConversations(@CurrentUser() user: User) {
    return this.chatService.getMyConversations(user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Iniciar o recuperar conversación con vendedor' })
  startConversation(@CurrentUser() user: User, @Body() dto: StartConversationDto) {
    return this.chatService.getOrCreateConversation(user.id, dto.sellerId, dto.productId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Mensajes de una conversación' })
  getMessages(@Param('id') id: string, @CurrentUser() user: User) {
    return this.chatService.getConversationMessages(id, user.id);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Enviar mensaje' })
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(id, user.id, dto.content);
  }
}
