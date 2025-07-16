import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './modules/user/user.route';
import arweaveRoutes from './modules/arweave/arweave.route';

// Create Express application
const app: Application = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Welcome to ArweaveNtegra API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            users: '/api/users',
            arweave: '/api/arweave'
        }
    });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/arweave', arweaveRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

export default app;
