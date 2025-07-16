import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isDevelopment = process.env.NODE_ENV !== 'production';

export const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/arweaventegra',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    
    // Arweave Configuration
    arweave: {
        host: isDevelopment ? 'localhost' : 'arweave.net',
        port: isDevelopment ? 1984 : 443,
        protocol: isDevelopment ? 'http' : 'https',
        
        // Get wallet based on environment
        getWallet: async () => {
            if (isDevelopment) {
                // Try to get wallet from environment first
                const testWallet = process.env.ARWEAVE_TEST_WALLET;
                if (testWallet) {
                    try {
                        return JSON.parse(testWallet);
                    } catch (error) {
                        console.warn('Failed to parse ARWEAVE_TEST_WALLET from .env, falling back to generated wallet');
                    }
                }
                
                // Fall back to generated wallet if env variable is not set
                const { ArweaveTestConfig } = await import('./arweave.test');
                return ArweaveTestConfig.getTestWallet();
            }
            
            // In production, load from environment variable
            const walletJson = process.env.ARWEAVE_WALLET_JWK;
            if (!walletJson) {
                throw new Error('ARWEAVE_WALLET_JWK environment variable is required in production');
            }
            return JSON.parse(walletJson);
        }
    }
};
