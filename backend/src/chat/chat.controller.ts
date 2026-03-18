import { Controller, Get, Post, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getMyConversations(@Req() req) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @Post('conversations/:otherUserId')
  getOrCreateConversation(@Req() req, @Param('otherUserId', ParseIntPipe) otherUserId: number) {
    return this.chatService.getOrCreateConversation(req.user.id, otherUserId);
  }
}
