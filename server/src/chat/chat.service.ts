import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findAllRooms(userId: string, userRoles: string[] = []) {
    const isCollegeAdmin = userRoles.includes('college_admin');

    if (isCollegeAdmin) {
      return this.findDefaultRoomsForCollegeAdmin(userId);
    }

    const userChatRooms = await this.prisma.userChatRoom.findMany({
      where: { userId },
      include: {
        chatRoom: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return userChatRooms.map((ucr) => ucr.chatRoom);
  }

  private async findDefaultRoomsForCollegeAdmin(userId: string) {
    const departments = await this.prisma.department.findMany({
      select: {
        name: true,
        timetableLabel: true,
      },
    });

    const defaultRoomNames = new Set<string>(['PEC Global Announcements']);
    departments.forEach((department) => {
      if (department.timetableLabel) {
        defaultRoomNames.add(department.timetableLabel);
      } else if (department.name) {
        defaultRoomNames.add(department.name);
      }
    });

    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        isGroup: true,
        name: {
          in: Array.from(defaultRoomNames),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const roomIds = rooms.map((room) => room.id);
    if (roomIds.length > 0) {
      const existingMemberships = await this.prisma.userChatRoom.findMany({
        where: {
          userId,
          chatRoomId: { in: roomIds },
        },
        select: {
          chatRoomId: true,
        },
      });

      const existingIds = new Set(
        existingMemberships.map((membership) => membership.chatRoomId),
      );
      const missingIds = roomIds.filter((id) => !existingIds.has(id));

      if (missingIds.length > 0) {
        await this.prisma.userChatRoom.createMany({
          data: missingIds.map((chatRoomId) => ({ userId, chatRoomId })),
          skipDuplicates: true,
        });
      }
    }

    return rooms;
  }

  async findMessages(roomId: string, userId: string, limit: number = 50) {
    // Verify participation
    const participation = await this.prisma.userChatRoom.findFirst({
      where: { userId, chatRoomId: roomId },
    });

    if (!participation) {
      throw new ForbiddenException('You are not a participant of this room');
    }

    return this.prisma.message.findMany({
      where: { chatRoomId: roomId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async createRoom(dto: CreateRoomDto, creatorId: string) {
    const allParticipantIds = Array.from(new Set([...dto.userIds, creatorId]));

    return this.prisma.chatRoom.create({
      data: {
        name: dto.name,
        isGroup: dto.isGroup ?? true,
        participants: {
          create: allParticipantIds.map((id) => ({
            userId: id,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async sendMessage(dto: SendMessageDto, senderId: string) {
    // Verify participation
    const participation = await this.prisma.userChatRoom.findFirst({
      where: { userId: senderId, chatRoomId: dto.chatRoomId },
    });

    if (!participation) {
      throw new ForbiddenException('You are not a participant of this room');
    }

    return this.prisma.message.create({
      data: {
        content: dto.content,
        senderId,
        chatRoomId: dto.chatRoomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getChatUsers(query: string) {
    if (!query) return [];

    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 10,
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }
}
