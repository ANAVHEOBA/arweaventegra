import { Router } from 'express';
import { UserController } from './user.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/connect-wallet', UserController.connectWallet);

// Protected routes
router.post('/disconnect-wallet', 
    AuthMiddleware.verifyToken,    // First verify the JWT token
    AuthMiddleware.verifyWallet,   // Then verify the wallet status
    UserController.disconnectWallet
);

// Example of using all middleware
// router.patch('/wallet/:walletAddress', 
//     AuthMiddleware.verifyToken, 
//     AuthMiddleware.verifyWallet,
//     AuthMiddleware.requireWalletOwner, 
//     UserController.updateWallet
// );

export default router;
