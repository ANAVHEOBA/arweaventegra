import { Request, Response } from 'express';
import { UserCrud } from './user.crud';
import { JWTService } from '../../services/jwt.service';

export class UserController {
    static async connectWallet(req: Request, res: Response) {
        try {
            const { walletAddress } = req.body;

            if (!walletAddress) {
                return res.status(400).json({ message: 'Wallet address is required' });
            }

            // Find or create user
            let user = await UserCrud.findUserByWallet(walletAddress);
            
            if (!user) {
                // Create new user
                user = await UserCrud.createUser(walletAddress);
            } else {
                // Update nonce
                user = await UserCrud.updateUserNonce(walletAddress);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
            }

            // Generate JWT token
            const token = JWTService.generateToken(user);

            return res.status(200).json({
                message: 'Wallet connected successfully',
                token,
                user: {
                    walletAddress: user.walletAddress,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                }
            });

        } catch (error) {
            console.error('Connect wallet error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async disconnectWallet(req: Request, res: Response) {
        try {
            // Get wallet address from JWT token (assuming auth middleware adds it to req.user)
            const walletAddress = (req as any).user?.walletAddress;
            
            if (!walletAddress) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Update last activity timestamp
            await UserCrud.updateUser(walletAddress, {
                lastLogin: new Date()
            });

            return res.status(200).json({
                message: 'Wallet disconnected successfully'
            });

        } catch (error) {
            console.error('Disconnect wallet error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
