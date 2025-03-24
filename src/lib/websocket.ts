import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { parse } from 'url';
import { getSession } from 'next-auth/react';
import prisma from './prisma';

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocketClient>>;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ noServer: true });
    this.clients = new Map();

    server.on('upgrade', async (request, socket, head) => {
      try {
        const { pathname } = parse(request.url!, true);
        
        if (pathname === '/ws') {
          const session = await getSession({ req: request });
          
          if (!session?.user) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
          }

          this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, session.user);
          });
        }
      } catch (error) {
        console.error('WebSocket upgrade error:', error);
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws: WebSocketClient, user: any) => {
      ws.userId = user.id;
      ws.isAlive = true;

      // Add client to clients map
      if (!this.clients.has(user.id)) {
        this.clients.set(user.id, new Set());
      }
      this.clients.get(user.id)!.add(ws);

      // Handle messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.get(user.id)?.delete(ws);
        if (this.clients.get(user.id)?.size === 0) {
          this.clients.delete(user.id);
        }
      });

      // Heartbeat
      ws.on('pong', () => {
        ws.isAlive = true;
      });
    });

    // Heartbeat interval
    setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private async handleMessage(ws: WebSocketClient, data: any) {
    switch (data.type) {
      case 'typing':
        this.broadcastToUser(data.recipientId, {
          type: 'typing',
          senderId: ws.userId,
          conversationId: data.conversationId,
        });
        break;

      case 'read':
        await prisma.message.updateMany({
          where: {
            conversationId: data.conversationId,
            recipientId: ws.userId,
            read: false,
          },
          data: {
            read: true,
          },
        });
        break;

      // Add more message handlers as needed
    }
  }

  public broadcastToUser(userId: string, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  }

  public broadcastToAll(data: any) {
    this.wss.clients.forEach((client: WebSocketClient) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
} 