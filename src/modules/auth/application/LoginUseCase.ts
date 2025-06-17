import { User } from "../domain/entities/User";
import { IAuthService } from "../domain/ports/IAuthService";
import { IAuthRepository } from "../domain/repositories/IAuthRepository";
import { DiscordAuthProvider } from "../infrastructure/external/DiscordAuthProvider";
import { JWTService, TokenPayload, TokenResponse } from "../infrastructure/jwt/JWTService";
import { randomUUID } from "crypto";

export class LoginUseCase implements IAuthService {
    constructor(
        private readonly authRepository: IAuthRepository,
        private readonly discordAuthProvider: DiscordAuthProvider,
        private readonly jwtService: JWTService
    ) { }

    async loginWithDiscord(code: string, redirectUri: string): Promise<{
        tokens: TokenResponse,
        user: any
    }> {
        // Obtener tokens de Discord
        const discordTokens = await this.discordAuthProvider.exchangeCodeForToken(code, redirectUri);

        // Obtener información del usuario
        const userInfo = await this.discordAuthProvider.getUserInfo(discordTokens.access_token);

        // Generar sessionId
        const sessionId = randomUUID();

        // Generar JWT tokens
        const payload: TokenPayload = {
            userId: userInfo.id,
            roles: userInfo.roles || []
        };

        const user = new User(
            userInfo.id,
            userInfo.username,
            userInfo.roles,
            sessionId
        );

        const tokens = this.jwtService.generateTokens(payload);

        // Almacenar tokens y sessionId
        await this.authRepository.storeDiscordToken(userInfo.id, {
            ...discordTokens,
            jwt_access_token: tokens.accessToken,
            jwt_refresh_token: tokens.refreshToken,
            sessionId
        });

        return {
            tokens,
            user
        };
    }

    async refreshToken(refreshToken: string): Promise<TokenResponse | null> {
        const payload = this.jwtService.verifyRefreshToken(refreshToken);
        if (!payload) return null;

        // Aquí podrías verificar si el refreshToken está en la base de datos
        // y si no ha sido revocado

        const newPayload: TokenPayload = {
            userId: payload.userId,
            roles: [] // Aquí deberías obtener los roles del usuario desde la base de datos
        };

        return this.jwtService.generateTokens(newPayload);
    }

    async validateToken(token: string): Promise<TokenPayload | null> {
        return this.jwtService.verifyToken(token);
    }

    async validateSession(sessionId: string): Promise<{ userId: string } | null> {
        return this.authRepository.getSessionById(sessionId);
    }
}