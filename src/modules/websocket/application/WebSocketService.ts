import { IWebSocketService } from '../domain/ports/IWebSocketService';
import { SocketIOAdapter } from '../infrastructure/SocketIOAdapter';

export class WebSocketService implements IWebSocketService {
    private static instance: WebSocketService;

    constructor(private socketAdapter: SocketIOAdapter) { }

    // Patrón Singleton para acceso global
    public static getInstance(): WebSocketService {
        return WebSocketService.instance;
    }

    public static initialize(socketAdapter: SocketIOAdapter): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService(socketAdapter);
        }
        return WebSocketService.instance;
    }

    emitToUser(userId: string, event: string, data: any): void {
        this.socketAdapter.getIO().to(`user_${userId}`).emit(event, data);
    }

    emitToRoom(room: string, event: string, data: any): void {
        this.socketAdapter.getIO().to(room).emit(event, data);
    }

    emitToAll(event: string, data: any): void {
        this.socketAdapter.getIO().emit(event, data);
    }

    joinRoom(userId: string, room: string): void {
        const io = this.socketAdapter.getIO();
        const sockets = io.sockets.adapter.rooms.get(`user_${userId}`);

        if (sockets) {
            for (const socketId of sockets) {
                io.sockets.sockets.get(socketId)?.join(room);
            }
        }
    }

    leaveRoom(userId: string, room: string): void {
        const io = this.socketAdapter.getIO();
        const sockets = io.sockets.adapter.rooms.get(`user_${userId}`);

        if (sockets) {
            for (const socketId of sockets) {
                io.sockets.sockets.get(socketId)?.leave(room);
            }
        }
    }

    getInstance(): any {
        return this.socketAdapter.getIO();
    }
}