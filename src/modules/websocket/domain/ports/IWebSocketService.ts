export interface IWebSocketService {
    // Métodos para emitir eventos
    emitToUser(userId: string, event: string, data: any): void;
    emitToRoom(room: string, event: string, data: any): void;
    emitToAll(event: string, data: any): void;

    // Métodos para gestionar salas
    joinRoom(userId: string, room: string): void;
    leaveRoom(userId: string, room: string): void;

    // Método para obtener instancia (opcional, para casos avanzados)
    getInstance(): any;
}