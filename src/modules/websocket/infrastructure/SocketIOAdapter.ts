import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '@/shared/config';
import { JWTService } from '@/modules/auth/infrastructure/jwt/JWTService';

export class SocketIOAdapter {
    jwtService: JWTService;
    private io: SocketIOServer;
    private userSocketMap: Map<string, string[]> = new Map(); // userId -> socketIds[]

    constructor(
        server: HttpServer
    ) {
        this.jwtService = new JWTService();
        this.io = new SocketIOServer(server, {
            cors: {
                origin: config.server.host,
                methods: ['GET', 'POST'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            },
            path: '/ws'
        });

        console.log("websocker url: ", config.server.host + "/ws")

        this.setupMiddleware();
        this.setupConnectionHandler();
    }

    private setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const auth = socket.handshake.headers.authorization;
                
                if (!auth || !auth.startsWith('Bearer ')) {
                    return next(new Error('No token provided'));
                }

                const token = auth.split(' ')[1];
                
                // Verificar el token usando el servicio de autenticación
                const session = this.jwtService.verifyToken(token);
                if (!session) {
                    return next(new Error('Invalid token'));
                }

                // Guardar el ID de usuario en el socket
                socket.data.userId = session.userId;

                // Registrar el socket en el mapa de usuarios
                this.addSocketToUser(session.userId, socket.id);

                // Unir al usuario a sus salas personales
                socket.join(`user_${session.userId}`);
                socket.join(`giro_${session.userId}`);
                socket.join(`xp_${session.userId}`);
                socket.join(`coin_${session.userId}`);

                // Unir al usuario a la sala de autenticados
                socket.join('authenticated');

                return next();
            } catch (error) {
                return next(new Error('Authentication failed'));
            }
        });
    }

    private setupConnectionHandler() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.data.userId}`);

            // Manejar desconexión
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.data.userId}`);
                this.removeSocketFromUser(socket.data.userId, socket.id);
            });
        });
    }

    private addSocketToUser(userId: string, socketId: string) {
        if (!this.userSocketMap.has(userId)) {
            this.userSocketMap.set(userId, []);
        }
        this.userSocketMap.get(userId)?.push(socketId);
    }

    private removeSocketFromUser(userId: string, socketId: string) {
        if (this.userSocketMap.has(userId)) {
            const sockets = this.userSocketMap.get(userId) || [];
            const updatedSockets = sockets.filter(id => id !== socketId);

            if (updatedSockets.length === 0) {
                this.userSocketMap.delete(userId);
            } else {
                this.userSocketMap.set(userId, updatedSockets);
            }
        }
    }

    public getIO(): SocketIOServer {
        return this.io;
    }
}