import dotenv from "dotenv";
dotenv.config({ path: '.env' });

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from 'hono/cors';
import { createServer } from 'http';
import { authRoutes } from "./modules/auth/interface/api/routes";
import { connectToDatabase } from "./shared/connection";
import { SocketIOAdapter } from "./modules/websocket/infrastructure/SocketIOAdapter";
import { EventBus } from './shared/infrastructure/rabbit/EventBus';
import { VerifyTokenUseCase } from "./modules/auth/application/VerifyTokenUseCase";
import { JWTService } from "./modules/auth/infrastructure/jwt/JWTService";
import { authMiddleware } from "./modules/auth/interface/api/AuthMiddleware";
import { userRoutes } from "./modules/user/interface/api/routes";
import { WebSocketService } from "./modules/websocket/infrastructure/WebSocketService";
import { config } from "./shared/config";

//Cargar variables de entorno
const jwtService = new JWTService();
const verifyTokenUseCase = new VerifyTokenUseCase(jwtService);

//Inicializar aplicacion
const app: Hono = new Hono();
const corsOptions = {
    origin: config.frontend.host, // Especifica el origen de tu frontend
    credentials: true, // Permitir que las cookies se envíen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Permite 'Cookie' en los encabezados
};
app.use('/*', cors(corsOptions));

//Ruta principal
//GET BRINDAR INFORMACION
//POST PROCESES DATOS O INFORMACION 
app.route("/auth", authRoutes);
authRoutes.use('/*', authMiddleware(verifyTokenUseCase));

app.route("/user", userRoutes);

// Crear servidor HTTP
const httpServer = createServer();

// Inicializar WebSocket
WebSocketService.initializeServer(httpServer);
const wsService = WebSocketService.getInstance();

// Inicializar EventBus
const eventBus = EventBus.getInstance();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:pass@localhost:5672';

async function bootstrap() {
    try {
        // Conectar a RabbitMQ
        await eventBus.connect(RABBITMQ_URL);
        console.log('Conectado a RabbitMQ');

        const port = config.server.port;

        // Iniciar el servidor HTTP

        serve({
            fetch: app.fetch,
            port: port,
        }).on('listening', () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Ejecutar la aplicacion
connectToDatabase()
    .then(bootstrap)
    .catch(err => console.error("Failed to start server:", err));
