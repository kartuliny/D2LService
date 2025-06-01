import { Context, Hono } from "hono";
import { DiscordAuthProvider } from "../../infrastructure/external/DiscordAuthProvider";
import { AuthController } from "./AuthController";
import { MongoAuthRepository } from "../../infrastructure/persistence/MongoAuthRepository";

//Crear las dependencias de AuthController
const discordAuthProvider = new DiscordAuthProvider();
const mongoAuthRepository = new MongoAuthRepository();

//Crea el controlador
const authController = new AuthController(mongoAuthRepository, discordAuthProvider);

//se crea la ruta
const authRoutes = new Hono();

//Se define las rutas
authRoutes.get('/getDiscordToken', (c: Context) => authController.login(c));

export { authRoutes };