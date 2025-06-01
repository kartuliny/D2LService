import { config } from "@/shared/config";

export class DiscordAuthProvider {
    private readonly discordAPI = 'https://discord.com/api/';

    async exchangeCodeForToken(code: string, redirectUri: string): Promise<any> {

        console.log(`${config.discord.client_id}:${config.discord.client_secret}`);
        const authCreds = Buffer.from(`${config.discord.client_id}:${config.discord.client_secret}`).toString('base64');
        console.log(authCreds);
        const data = {
            code: code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
        }

        const formData = new URLSearchParams(data).toString();
        console.log(formData);

        const response = await fetch(this.discordAPI + "oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${authCreds}`,
            },
            body: formData,
        })

        const tokens = await response.json();
        console.log(tokens);

        if (response.status !== 200) {
            throw new Error(tokens.error);
        }

        return tokens;
    }

    async getUserInfo(accessToken: string): Promise<any> {
        const response = await fetch(this.discordAPI + 'users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await response.json();

        if (userData.message) {
            throw new Error(`Error al obtener información de usuario: ${userData.message}`);
        }

        // Obtener roles del usuario (admin, history, etc.)
        const roles = this.getUserRoles(userData.id);
        userData.roles = roles;

        return userData;
    }

    private getUserRoles(userId: string): string[] {
        let roles: string[] = [];
        const adminIds: string[] = config.settings.roles.admins || []
        const historyIds: string[] = config.settings.roles.history || []

        if (adminIds.includes(userId)) roles.push("admin");
        if (historyIds.includes(userId)) roles.push("history");

        return roles;
    }
}