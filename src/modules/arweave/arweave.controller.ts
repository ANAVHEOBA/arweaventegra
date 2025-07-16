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
                    tags,
                    tempTransactionId
                );

                // Get the updated record
                const updatedRecord = await ArweaveCrud.getFileByTransactionId(transactionId);

                if (!updatedRecord) {
                    throw new Error('Failed to get updated file record');
                }

                return res.status(200).json({
                    message: 'File uploaded successfully',
                    data: {
                        transactionId,
                        cost: updatedRecord.cost,
                        status: updatedRecord.status,
                        permanentUrl: updatedRecord.permanentUrl
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

    static async getUserFiles(req: AuthRequest, res: Response) {
        try {
            const walletAddress = req.user?.walletAddress;
            if (!walletAddress) {
                return res.status(401).json({ message: 'Wallet address required' });
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await ArweaveCrud.getUserFiles(walletAddress, page, limit);

            return res.status(200).json({
                message: 'Files retrieved successfully',
                data: {
                    files: result.files.map(file => ({
                        transactionId: file.transactionId,
                        fileName: file.fileName,
                        fileSize: file.fileSize,
                        status: file.status,
                        permanentUrl: file.permanentUrl,
                        uploadedAt: file.createdAt,
                        cost: file.cost,
                        metadata: file.metadata
                    })),
                    pagination: {
                        total: result.total,
                        pages: result.pages,
                        currentPage: page,
                        limit
                    }
                }
            });
        } catch (error) {
            console.error('Get user files error:', error);
            return res.status(500).json({ 
                message: 'Failed to retrieve files',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async retryUpload(req: AuthRequest, res: Response) {
        try {
            const { transactionId } = req.params;
            const walletAddress = req.user?.walletAddress;

            if (!walletAddress) {
                return res.status(401).json({ message: 'Wallet address required' });
            }

            // Get the file record first to check ownership
            const fileRecord = await ArweaveCrud.getFileByTransactionId(transactionId);
            if (!fileRecord) {
                return res.status(404).json({ message: 'File not found' });
            }

            // Check if the user owns this file
            if (fileRecord.uploadedBy !== walletAddress) {
                return res.status(403).json({ message: 'Not authorized to retry this upload' });
            }

            // Attempt to retry the upload
            const updatedRecord = await ArweaveCrud.retryUpload(transactionId);

            return res.status(200).json({
                message: 'Upload retry initiated successfully',
                data: {
                    transactionId: updatedRecord.transactionId,
                    status: updatedRecord.status,
                    permanentUrl: updatedRecord.permanentUrl
                }
            });

        } catch (error) {
            console.error('Retry upload error:', error);
            return res.status(500).json({ 
                message: 'Failed to retry upload',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
