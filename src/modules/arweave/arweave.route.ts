import { Router } from 'express';
import multer from 'multer';
import { ArweaveController } from './arweave.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// File upload endpoint
router.post(
    '/upload',
    AuthMiddleware.verifyToken,
    upload.single('file'),
    ArweaveController.uploadFile
);

// Get file status endpoint
router.get(
    '/status/:transactionId',
    AuthMiddleware.verifyToken,
    ArweaveController.getFileStatus
);

// Get all files for a wallet address (paginated)
router.get(
    '/files',
    AuthMiddleware.verifyToken,
    ArweaveController.getUserFiles
);

// Retry failed upload
router.post(
    '/retry/:transactionId',
    AuthMiddleware.verifyToken,
    ArweaveController.retryUpload
);

export default router;
