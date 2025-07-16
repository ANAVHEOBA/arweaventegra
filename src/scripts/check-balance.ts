import Arweave from 'arweave';
import { ArweaveTestConfig } from '../config/arweave.test';

async function checkBalance() {
    const endpoints = [
        { name: 'AR-IO Testnet', host: 'ar-io.dev' },
        { name: 'Testnet 1', host: 'testnet.arweave.net' }
    ];

    // Get the wallet
    const wallet = ArweaveTestConfig.getTestWallet();
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nChecking balance on ${endpoint.name} (${endpoint.host}):`);
            
            const arweave = Arweave.init({
                host: endpoint.host,
                port: 443,
                protocol: 'https',
                timeout: 20000,
                logging: false
            });

            // Get wallet address
            const address = await arweave.wallets.jwkToAddress(wallet);
            console.log('Wallet address:', address);
            
            // Get balance
            const winston = await arweave.wallets.getBalance(address);
            const ar = arweave.ar.winstonToAr(winston);
            
            console.log('Balance in winston:', winston);
            console.log('Balance in AR:', ar);
            console.log(`Check in browser: https://${endpoint.host}/address/${address}`);
            
        } catch (error: any) {
            console.log(`Error with ${endpoint.name}:`, error.message || 'Unknown error');
        }
    }
}

checkBalance().catch(console.error); 