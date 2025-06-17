import jwt from 'jsonwebtoken';
import { config } from '@/shared/config';


export interface TokenPayload {
    userId: string;
    roles: string[];
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export class JWTService {
    generateTokens(payload: TokenPayload): TokenResponse {
        const accessToken = jwt.sign(
            payload,
            config.jwt.secret,
            {
                expiresIn: "30d"
            }
        );

        const refreshToken = jwt.sign({ userId: payload.userId }, config.jwt.refreshSecret, {
            expiresIn: "7d"
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: this.getExpirationTime(config.jwt.expiresIn)
        };
    }

    verifyToken(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, config.jwt.secret) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    verifyRefreshToken(token: string): { userId: string } | null {
        try {
            return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
        } catch (error) {
            return null;
        }
    }

    private getExpirationTime(expiresIn: string): number {
        // Convertir '1d', '2h', etc. a milisegundos
        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1));

        switch (unit) {
            case 'd': return value * 24 * 60 * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'm': return value * 60 * 1000;
            case 's': return value * 1000;
            default: return 24 * 60 * 60 * 1000; // 1 día por defecto
        }
    }
}