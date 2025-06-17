import { Context, Hono } from "hono";
import { DiscordAuthProvider } from "../../infrastructure/external/DiscordAuthProvider";
import { AuthController } from "./AuthController";
import { MongoAuthRepository } from "../../infrastructure/persistence/MongoAuthRepository";
import { LoginUseCase } from "../../application/LoginUseCase";
import { JWTService } from "../../infrastructure/jwt/JWTService";

// Crear las dependencias
const discordAuthProvider = new DiscordAuthProvider();
const mongoAuthRepository = new MongoAuthRepository();
const jwtService = new JWTService();

// Crear el caso de uso
const loginUseCase = new LoginUseCase(
    mongoAuthRepository,
    discordAuthProvider,
    jwtService
);

// Crear el controlador
const authController = new AuthController(loginUseCase);

// Crear las rutas
const authRoutes = new Hono();

// Definir las rutas
authRoutes.get('/getDiscordToken', (c: Context) => authController.login(c));
authRoutes.post('/refresh', (c: Context) => authController.refreshToken(c));

export { authRoutes };