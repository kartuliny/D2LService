import { JWTService, TokenPayload } from "../infrastructure/jwt/JWTService";

export class VerifyTokenUseCase {
    constructor(
        private readonly jwtService: JWTService
    ) { }
    async execute(token: string): Promise<TokenPayload | null> {
        return this.jwtService.verifyToken(token);
    }
}