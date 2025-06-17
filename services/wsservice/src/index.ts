import { createServer } from 'http';
import { Server } from 'socket.io';
import { connect, Channel, ChannelModel } from 'amqplib';
import { config } from 'dotenv';

config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:pass@rabbitmq:5672';
const PORT = process.env.PORT || 3010;

export class WebSocketService {
    private io: Server;
    private connection!: ChannelModel;
    private channel!: Channel;
    private static instance: WebSocketService;

    private constructor() {
        const httpServer = createServer();
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        httpServer.listen(PORT, () => {
            console.log(`WebSocket Server running on port ${PORT}`);
        });

        this.setupWebSocket();
    }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    async connectToRabbitMQ() {
        try {
            this.connection = await connect(RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            
            // Crear exchanges para diferentes tipos de eventos
            await this.channel.assertExchange('notifications', 'topic', { durable: false });
            await this.channel.assertExchange('chat', 'topic', { durable: false });
            
            console.log('Connected to RabbitMQ');
            
            this.setupRabbitMQSubscriptions();
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            setTimeout(() => this.connectToRabbitMQ(), 5000);
        }
    }

    private setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Manejar unión a salas
            socket.on('join-room', (room: string) => {
                socket.join(room);
                console.log(`Client ${socket.id} joined room ${room}`);
            });

            // Manejar mensajes de chat
            socket.on('chat-message', async (data: { room: string, message: any }) => {
                // Emitir a la sala específica
                this.io.to(data.room).emit('chat-message', data.message);
                
                // Publicar en RabbitMQ para otros servicios
                if (this.channel) {
                    this.channel.publish(
                        'chat',
                        `room.${data.room}`,
                        Buffer.from(JSON.stringify({
                            type: 'chat-message',
                            room: data.room,
                            message: data.message,
                            timestamp: new Date().toISOString()
                        }))
                    );
                }
            });

            // Manejar notificaciones
            socket.on('notification', async (data: { type: string, payload: any }) => {
                if (this.channel) {
                    this.channel.publish(
                        'notifications',
                        data.type,
                        Buffer.from(JSON.stringify({
                            ...data.payload,
                            timestamp: new Date().toISOString()
                        }))
                    );
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    private async setupRabbitMQSubscriptions() {
        try {
            // Suscribirse a mensajes de chat
            const { queue: chatQueue } = await this.channel.assertQueue('', { exclusive: true });
            await this.channel.bindQueue(chatQueue, 'chat', 'room.*');
            
            this.channel.consume(chatQueue, (msg) => {
                if (msg) {
                    const content = JSON.parse(msg.content.toString());
                    this.io.to(content.room).emit('chat-message', content.message);
                    this.channel.ack(msg);
                }
            });

            // Suscribirse a notificaciones
            const { queue: notifQueue } = await this.channel.assertQueue('', { exclusive: true });
            await this.channel.bindQueue(notifQueue, 'notifications', '#');
            
            this.channel.consume(notifQueue, (msg) => {
                if (msg) {
                    const content = JSON.parse(msg.content.toString());
                    this.io.emit('notification', content);
                    this.channel.ack(msg);
                }
            });

        } catch (error) {
            console.error('Error setting up RabbitMQ subscriptions:', error);
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

// Iniciar el servicio
const wsService = WebSocketService.getInstance();
wsService.connectToRabbitMQ(); 