import app from './app';
import connectDB from './config/database';
import { config } from './config/environment';

// Connect to MongoDB
connectDB()
    .then(() => {
        // Start server
        app.listen(config.port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${config.port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
    // Close server & exit process
    process.exit(1);
});
