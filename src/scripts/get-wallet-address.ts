import { ArweaveTestConfig } from '../config/arweave.test';
import Arweave from 'arweave';

async function getWalletAddress() {
    try {
        // Initialize Arweave
        const arweave = Arweave.init({
            host: 'ar-test.dev',
            port: 443,
            protocol: 'https'
        });

        // Get the wallet
        const wallet = ArweaveTestConfig.getTestWallet();
        
        // Get wallet address
        const address = await arweave.wallets.jwkToAddress(wallet);
        
        console.log('Your wallet address:', address);
        
        try {
            // Get wallet balance
            const winston = await arweave.wallets.getBalance(address);
            console.log('Balance in winston:', winston);
            const ar = arweave.ar.winstonToAr(winston);
            console.log('Balance in AR:', ar);
        } catch (balanceError) {
            console.log('Note: Balance might take a few minutes to appear on testnet');
            console.log('You can also check your balance at:');
            console.log(`https://ar-test.dev/address/${address}`);
        }
        
    } catch (error: any) {
        if (error.message) {
            console.error('Error:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
    }
}

getWalletAddress();