import { Context } from "hono";
import { DiscordAuthProvider } from "../../infrastructure/external/DiscordAuthProvider";
import { config } from "@/shared/config";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class AuthController {
    constructor(
        private readonly authRepository: IAuthRepository,
        private readonly discordAuthProvider: DiscordAuthProvider
    ) { }

    async login(context: Context): Promise<Response> {
        const code = context.req.query("code");

        if (!code || code.length < 10) {
            return context.json({
                status: "error",
                message: "Codigo invalido",
                code: code
            }, 400)
        }

        const redirectUri = `${config.server.host}:${config.server.port}/auth/getDiscordToken`

        const tokens = await this.discordAuthProvider.exchangeCodeForToken(code, redirectUri);
        const userInfo = await this.discordAuthProvider.getUserInfo(tokens.access_token);

        await this.authRepository.storeDiscordToken(userInfo.id, tokens);

        console.log(userInfo);
        
        return context.json({
            status: "success",
            message: "Codigo valido",
            code: code,
            token: tokens
        })
    }


}