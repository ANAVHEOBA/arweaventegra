import { Request, Response } from 'express';
import { ArweaveCrud } from './arweave.crud';
import { AuthRequest } from '../../middleware/auth.middleware';
import crypto from 'crypto';

export class ArweaveController {
    static async uploadFile(req: AuthRequest, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file provided' });
            }

            const { file } = req;
            const walletAddress = req.user?.walletAddress;

            if (!walletAddress) {
                return res.status(401).json({ message: 'Wallet address required' });
            }

            // Calculate upload cost
            const cost = await ArweaveCrud.calculateUploadCost(file.size);

            // Generate a temporary transaction ID
            const tempTransactionId = crypto.randomBytes(32).toString('hex');

            // Prepare metadata tags
            const tags = [
                { name: 'Content-Type', value: file.mimetype },
                { name: 'User-Agent', value: req.get('user-agent') || 'Unknown' },
                { name: 'Original-Name', value: file.originalname },
                { name: 'Uploader-Address', value: walletAddress }
            ];

            // Create initial file record with pending status
            const fileRecord = await ArweaveCrud.createFileRecord({
                transactionId: tempTransactionId,
                fileName: file.originalname,
                fileSize: file.size,
                fileType: file.mimetype.split('/')[0],
                contentType: file.mimetype,
                uploadedBy: walletAddress,
                status: 'pending',
                cost: {
                    ar: cost.ar,
                    usd: 0, // TODO: Add AR to USD conversion
                    bytes: cost.bytes
                },
                metadata: {
                    tags
                }
            });

            try {
                // Upload file to Arweave
                const { transactionId } = await ArweaveCrud.uploadFile(
                    file.buffer,
                    file.mimetype,
                    tags
                );

                // Update file record with actual transaction ID and status
                const updatedRecord = await ArweaveCrud.updateFileStatus(
                    tempTransactionId,
                    'processing',
                    `https://${process.env.NODE_ENV === 'production' ? 'arweave.net' : 'localhost:1984'}/${transactionId}`
                );

                return res.status(200).json({
                    message: 'File uploaded successfully',
                    data: {
                        transactionId,
                        cost: updatedRecord?.cost,
                        status: updatedRecord?.status,
                        permanentUrl: updatedRecord?.permanentUrl
                    }
                });

            } catch (uploadError) {
                // If upload fails, update status and return error
                await ArweaveCrud.updateFileStatus(tempTransactionId, 'failed');
                throw uploadError;
            }

        } catch (error) {
            console.error('File upload error:', error);
            return res.status(500).json({ 
                message: 'File upload failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getFileStatus(req: AuthRequest, res: Response) {
        try {
            const { transactionId } = req.params;
            const file = await ArweaveCrud.getFileByTransactionId(transactionId);

            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }

            return res.status(200).json({
                data: {
                    transactionId: file.transactionId,
                    status: file.status,
                    permanentUrl: file.permanentUrl,
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    uploadedAt: file.createdAt
                }
            });

        } catch (error) {
            console.error('Get file status error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
