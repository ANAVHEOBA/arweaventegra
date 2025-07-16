import { ArweaveTestConfig } from '../src/config/arweave.test';

async function main() {
    try {
        await ArweaveTestConfig.start();
        console.log('Test environment started successfully!');
        console.log('Press Ctrl+C to stop the test environment.');
        
        // Keep the process running
        process.stdin.resume();
        
        // Handle cleanup on exit
        process.on('SIGINT', async () => {
            console.log('\nStopping test environment...');
            await ArweaveTestConfig.stop();
            process.exit();
        });
    } catch (error) {
        console.error('Failed to start test environment:', error);
        process.exit(1);
    }
}

main(); 