import { AuthModel } from "@/shared/infrastructure/database/mongodb/models/AuthModel";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class MongoAuthRepository implements IAuthRepository {
    async storeDiscordToken(userId: string, tokens: any): Promise<void> {
        const expires = Date.now() + (tokens.expires_in * 1000);

        await AuthModel.updateOne(
            { _id: userId },
            {
                $set: {
                    discord_access_token: tokens.access_token,
                    discord_refresh_token: tokens.refresh_token,
                    expires: expires,
                    last_activity: Date.now()
                },
            },
            { upsert: true }
        )
    }
}