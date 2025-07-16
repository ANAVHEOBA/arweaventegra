import Arweave from 'arweave';
import ArLocal from 'arlocal';
import fs from 'fs';
import path from 'path';

export class ArweaveTestConfig {
    private static arlocal: ArLocal;
    private static arweave: Arweave;

    static async start() {
        // Start ArLocal server
        this.arlocal = new ArLocal(1984, false);
        await this.arlocal.start();

        // Initialize Arweave with ArLocal
        this.arweave = Arweave.init({
            host: 'localhost',
            port: 1984,
            protocol: 'http'
        });

        // Generate a test wallet if it doesn't exist
        const walletPath = path.join(__dirname, 'arweave-test-key.json');
        
        if (!fs.existsSync(walletPath)) {
            const wallet = await this.arweave.wallets.generate();
            fs.writeFileSync(walletPath, JSON.stringify(wallet));
            
            // Fund the wallet with test tokens
            const walletAddress = await this.arweave.wallets.jwkToAddress(wallet);
            await this.arweave.api.get(`/mint/${walletAddress}/1000000000000000`);
            
            console.log('Created and funded test wallet:', walletAddress);
        }

        console.log('ArLocal test environment running on http://localhost:1984');
    }

    static async stop() {
        if (this.arlocal) {
            await this.arlocal.stop();
        }
    }

    static getTestWallet() {
        const walletPath = path.join(__dirname, 'arweave-test-key.json');
        if (fs.existsSync(walletPath)) {
            return JSON.parse(fs.readFileSync(walletPath, 'utf8'));
        }
        throw new Error('Test wallet not found. Please start the test environment first.');
    }
} 