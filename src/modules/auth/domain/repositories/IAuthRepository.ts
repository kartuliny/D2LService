export interface AuthDiscordTokens {
    access_token: string;
    refresh_token: string;
}

export interface IAuthRepository {
    storeDiscordToken(userId: string, tokens: AuthDiscordTokens): Promise<void>;
}