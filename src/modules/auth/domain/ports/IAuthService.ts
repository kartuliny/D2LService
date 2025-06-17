import { TokenPayload, TokenResponse } from "../../infrastructure/jwt/JWTService";

export interface IAuthService {
    loginWithDiscord(code: string, redirectUri: string): Promise<{
        tokens: TokenResponse,
        user: any
    }>;
    refreshToken(refreshToken: string): Promise<TokenResponse | null>;
    validateToken(token: string): Promise<TokenPayload | null>;
    validateSession(sessionId: string): Promise<{ userId: string } | null>;
}