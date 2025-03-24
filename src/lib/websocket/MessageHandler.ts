import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export class MessageHandler {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST'],
      },
    });

    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      try {
        const decoded = await verifyToken(token);
        socket.data.userId = decoded.sub;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;

      // Join user's room
      socket.join(`user:${userId}`);

      socket.on('send_message', async (data) => {
        try {
          const message = await prisma.message.create({
            data: {
              content: data.content,
              senderId: userId,
              receiverId: data.receiverId,
              conversationId: data.conversationId,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          });

          // Emit to sender and receiver
          this.io.to(`user:${userId}`).emit('new_message', message);
          this.io.to(`user:${data.receiverId}`).emit('new_message', message);
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('typing', (data) => {
        socket.to(`user:${data.receiverId}`).emit('user_typing', {
          userId,
          conversationId: data.conversationId,
        });
      });

      socket.on('disconnect', () => {
        socket.leave(`user:${userId}`);
      });
    });
  }
} 