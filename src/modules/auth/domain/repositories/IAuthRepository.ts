export interface AuthTokens {
    // Discord tokens
    access_token: string;
    refresh_token: string;
    // JWT tokens
    jwt_access_token?: string;
    jwt_refresh_token?: string;
    // Session
    session_id?: string;
}

export interface IAuthRepository {
    storeDiscordToken(userId: string, tokens: AuthTokens): Promise<void>;
    getSessionById(sessionId: string): Promise<{ userId: string } | null>;
}