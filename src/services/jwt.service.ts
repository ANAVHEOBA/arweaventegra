import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { IUser } from '../modules/user/user.interface';

export class JWTService {
    static generateToken(user: IUser): string {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const options: SignOptions = {
            expiresIn: '24h' // Changed to 24 hours instead of using env variable
        };

        return jwt.sign(
            { walletAddress: user.walletAddress },
            process.env.JWT_SECRET,
            options
        );
    }

    static verifyToken(token: string): JwtPayload {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    static generateNonce(): string {
        return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    }
}
