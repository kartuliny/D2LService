import { IAuthService } from "../../domain/ports/IAuthService";
import { LoginUseCase } from "../../application/LoginUseCase";
import { MongoAuthRepository } from "../persistence/MongoAuthRepository";
import { DiscordAuthProvider } from "../external/DiscordAuthProvider";
import { JWTService } from "../jwt/JWTService";

export const initializeAuthService = (): IAuthService => {
    const mongoAuthRepository = new MongoAuthRepository();
    const discordAuthProvider = new DiscordAuthProvider();
    const jwtService = new JWTService();

    return new LoginUseCase(
        mongoAuthRepository,
        discordAuthProvider,
        jwtService
    );
};