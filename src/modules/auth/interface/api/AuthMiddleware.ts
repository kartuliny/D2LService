import { Context, Next } from "hono";
import { VerifyTokenUseCase } from "../../application/VerifyTokenUseCase";

export function authMiddleware(authService: VerifyTokenUseCase) {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({
                status: "error",

                message: "No autorizado"

            }, 401);
        }

        const token = authHeader.split(' ')[1];
        const payload = await authService.execute(token);

        if (!payload) {
            return c.json({
                status: "error",
                message: "Token inválido o expirado"
            }, 401);
        }
        // Añadir información del usuario al contexto
        c.set('user', payload);
        await next();
    };
}