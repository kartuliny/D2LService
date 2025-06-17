import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { EventBus } from './EventBus';

export class WebSocketService {
    private io: SocketIOServer;
    private eventBus: EventBus;
    private static instance: WebSocketService;
    private static httpServer: HttpServer;

    private constructor() {
        if (!WebSocketService.httpServer) {
            throw new Error('HTTP Server not initialized. Call initializeServer first.');
        }

        this.io = new SocketIOServer(WebSocketService.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.eventBus = EventBus.getInstance();
        this.setupWebSocket();
    }

    static initializeServer(server: HttpServer) {
        WebSocketService.httpServer = server;
    }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    async initialize() {
        try {
            // Conectar a RabbitMQ antes de configurar las suscripciones
            const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:pass@localhost:5672';
            await this.eventBus.connect(RABBITMQ_URL);
            await this.setupEventBusSubscriptions();
            console.log('WebSocket Service initialized successfully');
        } catch (error) {
            console.error('Error initializing WebSocket Service:', error);
            // Reintentar la conexión después de un delay
            setTimeout(() => this.initialize(), 5000);
        }
    }

    private setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);

            // Unirse a sala personal del usuario
            socket.on('join-user-room', (userId: string) => {
                socket.join(`user_${userId}`);
                console.log(`Cliente ${socket.id} se unió a la sala user_${userId}`);
            });

            // Unirse a sala general de actualizaciones
            socket.on('join-updates-room', () => {
                socket.join('user_updates');
                console.log(`Cliente ${socket.id} se unió a la sala de actualizaciones`);
            });

            // Unirse a cualquier sala
            socket.on('join-room', (room: string) => {
                socket.join(room);
                console.log(`Cliente ${socket.id} se unió a la sala ${room}`);
            });

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });
    }

    private async setupEventBusSubscriptions() {
        try {
            // Suscribirse a mensajes del otro backend
            await this.eventBus.subscribe(
                'messages',
                'room.*',
                (message) => {
                    if (message.type === 'new-message') {
                        // Reenviar el mensaje a los clientes en la sala correspondiente
                        this.io.to(message.room).emit('receive-message', message.message);
                    }
                }
            );
            console.log('EventBus subscriptions setup completed');
        } catch (error) {
            console.error('Error setting up EventBus subscriptions:', error);
            throw error; // Propagar el error para el reintento
        }
    }

    // Método para emitir eventos a una sala específica
    public emitToRoom(room: string, event: string, data: any) {
        this.io.to(room).emit(event, data);
    }

    // Método para emitir eventos a todos los clientes
    public emitToAll(event: string, data: any) {
        this.io.emit(event, data);
    }
} 