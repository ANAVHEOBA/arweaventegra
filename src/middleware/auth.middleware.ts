import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt.service';
import { UserCrud } from '../modules/user/user.crud';

export interface AuthRequest extends Request {
    user?: {
        walletAddress: string;
        nonce?: string;
    };
}

export class AuthMiddleware {
    static async verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Get token from header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    message: 'Authorization token is required'
                });
            }

            // Extract token
            const token = authHeader.split(' ')[1];

            try {
                // Verify token
                const decoded = JWTService.verifyToken(token);
                
                // Check if user exists
                const user = await UserCrud.findUserByWallet(decoded.walletAddress);
                if (!user) {
                    return res.status(401).json({
                        message: 'User not found'
                    });
                }

                // Add user to request object
                req.user = {
                    walletAddress: decoded.walletAddress,
                    nonce: user.nonce
                };

                next();
            } catch (error) {
                return res.status(401).json({
                    message: 'Invalid or expired token'
                });
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    static async verifyWallet(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user?.walletAddress) {
                return res.status(401).json({
                    message: 'Wallet verification failed'
                });
            }

            // Get user with fresh database query
            const user = await UserCrud.findUserByWallet(req.user.walletAddress);
            if (!user) {
                return res.status(401).json({
                    message: 'Wallet not found'
                });
            }

            // Check if wallet is active
            if (user.lastLogin < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                return res.status(401).json({
                    message: 'Wallet session expired. Please reconnect.'
                });
            }

            next();
        } catch (error) {
            console.error('Wallet verification error:', error);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    static async requireWalletOwner(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { walletAddress } = req.params;
            
            if (req.user?.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                return res.status(403).json({
                    message: 'Access denied. Not the wallet owner'
                });
            }

            next();
        } catch (error) {
            console.error('Wallet owner check error:', error);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }
}
