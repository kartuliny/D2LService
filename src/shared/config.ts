export const config = {
    "discord": {
        "client_id": process.env.DISCORD_CLIENT_ID,
        "client_token": process.env.DISCORD_CLIENT_TOKEN,
        "client_secret": process.env.DISCORD_CLIENT_SECRET,
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
}