import { Context } from "hono";
import { config } from "@/shared/config";
import { IAuthService } from "../../domain/ports/IAuthService";

export class AuthController {
    constructor(
        private readonly authService: IAuthService
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

        const redirectUri = `${config.frontend.host}/callback`

        try {
            const { tokens, user } = await this.authService.loginWithDiscord(code, redirectUri);
            context.header('Set-Cookie', `sessionId=${user.sessionId}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`);

            return context.json({
                status: "success",
                message: "Login exitoso",
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
                user: {
                    id: user.id,
                    username: user.username,
                    roles: user.roles
                }
            });
        } catch (error) {
            return context.json({
                status: "error",
                message: "Error al iniciar sesion",
                error: error
            }, 500)
        }
    }

    async refreshToken(context: Context): Promise<Response> {
        const refreshToken = context.req.query("refresh-token") || '';

        if (!refreshToken) {
            return context.json({
                status: "error",
                message: "Token de refresco no proporcionado"
            }, 400);
        }

        const tokens = await this.authService.refreshToken(refreshToken);

        if (!tokens) {
            return context.json({
                status: "error",
                message: "Token de refresco invalido"
            }, 401);
        }

        return context.json({
            status: "success",
            message: "Token de acceso refrescado",
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
        });
    }
}