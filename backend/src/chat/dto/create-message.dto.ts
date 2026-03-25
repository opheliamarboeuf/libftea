import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  conversationId: number;  // ← manquant

  @IsNumber()
  senderId: number;        // ← manquant (userId → senderId)
}
