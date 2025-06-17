import { AuthModel } from "@/shared/infrastructure/database/mongodb/models/AuthModel";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class MongoAuthRepository implements IAuthRepository {
    async storeDiscordToken(userId: string, tokens: any): Promise<void> {
        const expires = Date.now() + (tokens.expires_in * 1000);

        await AuthModel.updateOne(
            { _id: userId },
            {
                $set: {
                    // Discord tokens
                    discord_access_token: tokens.access_token,
                    discord_refresh_token: tokens.refresh_token,
                    // JWT tokens
                    access_token: tokens.jwt_access_token,
                    refresh_token: tokens.jwt_refresh_token,
                    // Otros datos
                    expires: expires,
                    last_activity: Date.now(),
                    session_id: tokens.sessionId
                },
            },
            { upsert: true }
        )
    }

    async getSessionById(sessionId: string): Promise<{ userId: string } | null> {
        const auth = await AuthModel.findOne({ sessionId });
        if (!auth) return null;
        return { userId: auth._id };
    }
}