export class User {
    constructor(
        public readonly id: string,
        public readonly username: string,
        public readonly roles: string[],
        public readonly sessionId: string
    ) {}
    
    hasRole(role: string): boolean {
        return this.roles.includes(role);
    }
}