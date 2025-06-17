import { Context } from "hono";
import { WebSocketService } from "../../../websocket/infrastructure/WebSocketService";

export class UserController {
    getProfile(c: Context) {
        const user = c.get('user');
        const wsService = WebSocketService.getInstance();
        
        // Emitir actualización de perfil a la sala del usuario
        wsService.emitToRoom(`user_${user.id}`, 'profile_updated', {
            userId: user.id,
            data: user,
            timestamp: new Date().toISOString()
        });

        return c.json({
            status: "success",
            data: user
        });
    }

    // Ejemplo de método para actualizar perfil
    async updateProfile(c: Context) {
        try {
            const user = c.get('user');
            const body = await c.req.json();
            
            // Aquí iría la lógica de actualización del perfil
            
            const wsService = WebSocketService.getInstance();
            
            // Emitir a la sala personal del usuario
            wsService.emitToRoom(`user_${user.id}`, 'profile_updated', {
                userId: user.id,
                data: body,
                timestamp: new Date().toISOString()
            });

            // También podemos emitir a una sala general de actualizaciones
            wsService.emitToRoom('user_updates', 'user_profile_updated', {
                userId: user.id,
                type: 'profile_update',
                timestamp: new Date().toISOString()
            });

            return c.json({
                status: "success",
                message: "Profile updated successfully",
                data: body
            });
        } catch (error) {
            return c.json({
                status: "error",
                message: "Failed to update profile"
            }, 500);
        }
    }
}