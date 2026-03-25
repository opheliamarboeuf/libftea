import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}




  async areFriends(userIdA: number, userIdB: number): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: userIdA, addresseId: userIdB },
          { requesterId: userIdB, addresseId: userIdA },
        ],
      },
    });
    return !!friendship;
  }


  async getOrCreateConversation(userIdA: number, userIdB: number) {
    const friends = await this.areFriends(userIdA, userIdB);
    if (!friends) {
      throw new ForbiddenException('You must be friends to send messages.');
    }
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { User: { some: { id: userIdA } } },
          { User: { some: { id: userIdB } } },
        ],
      },
      include: {
        User: {
          select: {
            id: true, username: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        Message: {
          orderBy: { createdAt: 'asc' },
          include: {
            User: {
              select: {
                id: true, username: true,
                profile: { select: { avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        User: { connect: [{ id: userIdA }, { id: userIdB }] },
      },
      include: {
        User: {
          select: {
            id: true, username: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        Message: true,
      },
    });
  }

  async getUserConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: { User: { some: { id: userId } } },
      include: {
        User: {
          select: {
            id: true, username: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        Message: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
