import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users = [];

  private addUser(userId, socketId) {
    const user = this.users.find((user) => user.id === userId);
    if (user && user.socketId === socketId) {
      return this.users;
    } else {
      if (user && user.socketId !== socketId) {
        this.removeUser(user.socketId);
      }
      const newUser = { userId, socketId };
      this.users.push(newUser);
      return this.users;
    }
  }

  private removeUser(socketId) {
    this.users = this.users.filter((user) => user.socketId !== socketId);
  }

  private findConnectedUser(userId) {
    return this.users.find((user) => user.userId === userId);
  }

  handleConnection(socket: Socket) {
    socket.on('join', async ({ userId }) => {
      const users = await this.addUser(userId, socket.id);

      setInterval(() => {
        socket.emit('connectedUsers', {
          users: users.filter((user) => user.id !== userId),
        });
      }, 10000);
    });

    socket.on('like', async ({ postId, sender, receiver, like }) => {
      if (sender && receiver.id !== sender.userId) {
        const receiverSocket = this.findConnectedUser(receiver.id);
        if (receiverSocket && like) {
          this.server.to(receiverSocket.socketId).emit('notificationReceived', {
            postId,
            senderName: sender.name,
            receiverName: receiver.name,
            senderImage: sender.avatar,
          });
        }
      }
    });

    socket.on('comment', async ({ postId, sender, receiver }) => {
      if (sender && receiver.id !== sender.userId) {
        const receiverSocket = this.findConnectedUser(receiver.id);
        if (receiverSocket) {
          this.server.to(receiverSocket.socketId).emit('notificationReceived', {
            postId,
            senderName: sender.name,
            receiverName: receiver.name,
            receiverId: receiver.id,
            senderImage: sender.avatar,
            date: new Date().toISOString(),
          });
        }
      }
    });

    socket.on('follow', async ({ sender, receiver }) => {
      if (sender && receiver.id !== sender.userId) {
        const receiverSocket = this.findConnectedUser(receiver.id);
        if (receiverSocket) {
          this.server.to(receiverSocket.socketId).emit('notificationReceived', {
            senderName: sender.name,
            receiverName: receiver.name,
            receiverId: receiver.id,
            senderImage: sender.avatar,
            date: new Date().toISOString(),
          });
        }
      }
    });
  }

  handleDisconnect(socket: Socket) {
    this.removeUser(socket.id);
  }
}
