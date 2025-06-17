const { DISCORD_CLIENT_ID, DISCORD_CLIENT_TOKEN, DISCORD_CLIENT_SECRET, JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET } = process.env;

export const config = {
    "discord": {
        "client_id": DISCORD_CLIENT_ID,
        "client_token": DISCORD_CLIENT_TOKEN,
        "client_secret": DISCORD_CLIENT_SECRET,
    },
    "server": {
        "port": 3006,
        "host": "http://localhost",
    },
    "settings": {
        "roles": {
            "admins": [],
            "history": [],
        }
    },
    "jwt": {
        "secret": JWT_SECRET || "your-secret-key",
        "expiresIn": JWT_EXPIRES_IN || "30d",
        "refreshSecret": JWT_REFRESH_SECRET || "your-refresh-secret-key",
        "refreshExpiresIn": "7d"
    },
    "websocket": {
        "host": "http://localhost:3007"
    },
    "frontend": {
        "host": "http://localhost:3001"
    }
}