import Arweave from 'arweave';
import ArweaveFileModel from './arweave.model';
import { IArweaveFileDocument } from './arweave.interface';
import { config } from '../../config/environment';
import fs from 'fs';

export class ArweaveCrud {
    private static arweave = new Arweave({
        host: config.arweave.host,
        port: config.arweave.port,
        protocol: config.arweave.protocol
    });

    static async createFileRecord(fileData: Partial<IArweaveFileDocument>): Promise<IArweaveFileDocument> {
        try {
            const file = await ArweaveFileModel.create(fileData);
            return file;
        } catch (error) {
            throw new Error(`Error creating file record: ${error}`);
        }
    }

    static async getFileByTransactionId(transactionId: string): Promise<IArweaveFileDocument | null> {
        try {
            return await ArweaveFileModel.findOne({ transactionId });
        } catch (error) {
            throw new Error(`Error finding file: ${error}`);
        }
    }

    static async updateFileStatus(transactionId: string, status: string, permanentUrl?: string): Promise<IArweaveFileDocument | null> {
        try {
            return await ArweaveFileModel.findOneAndUpdate(
                { transactionId },
                { 
                    status,
                    ...(permanentUrl && { permanentUrl })
                },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating file status: ${error}`);
        }
    }

    static async calculateUploadCost(fileSize: number): Promise<{
        ar: number;
        winston: string;
        bytes: number;
    }> {
        try {
            const winston = await this.arweave.transactions.getPrice(fileSize);
            const ar = this.arweave.ar.winstonToAr(winston);
            
            return {
                ar: parseFloat(ar),
                winston: winston.toString(),
                bytes: fileSize
            };
        } catch (error) {
            console.error('Error calculating upload cost:', error);
            throw new Error(`Error calculating upload cost: ${error}`);
        }
    }

    static async uploadFile(
        fileBuffer: Buffer,
        contentType: string,
        tags: { name: string; value: string }[],
        tempTransactionId?: string
    ): Promise<{ transactionId: string }> {
        try {
            // Get wallet from config
            console.log('Getting wallet from config...');
            const wallet = await config.arweave.getWallet();
            console.log('Wallet loaded successfully');

            // Create transaction
            console.log('Creating transaction...');
            const transaction = await this.arweave.createTransaction({
                data: fileBuffer
            }, wallet);
            console.log('Transaction created successfully');

            // Add tags
            console.log('Adding tags to transaction...');
            transaction.addTag('Content-Type', contentType);
            for (const tag of tags) {
                transaction.addTag(tag.name, tag.value);
            }
            console.log('Tags added successfully');

            // Sign transaction
            console.log('Signing transaction...');
            await this.arweave.transactions.sign(transaction, wallet);
            console.log('Transaction signed successfully');

            // Submit transaction
            console.log('Uploading transaction...');
            try {
                const uploader = await this.arweave.transactions.getUploader(transaction);
                
                while (!uploader.isComplete) {
                    await uploader.uploadChunk();
                    console.log(`Upload progress: ${uploader.pctComplete}%`);
                }
                console.log('Upload completed successfully');

                // Update the record with new transaction ID and confirmed status
                if (tempTransactionId) {
                    await ArweaveFileModel.findOneAndUpdate(
                        { transactionId: tempTransactionId },
                        {
                            transactionId: transaction.id,
                            status: 'confirmed',
                            permanentUrl: `http://${process.env.NODE_ENV === 'production' ? 'arweave.net' : 'localhost:1984'}/${transaction.id}`
                        },
                        { new: true }
                    );
                    console.log('File record updated with confirmed status');
                }

            } catch (uploadError) {
                console.error('Upload error details:', uploadError);
                throw uploadError;
            }

            return {
                transactionId: transaction.id
            };
        } catch (error) {
            console.error('Full error details:', error);
            throw new Error(`Error uploading file: ${error}`);
        }
    }

    static async retryUpload(transactionId: string): Promise<IArweaveFileDocument> {
        try {
            // Get the failed upload record
            const fileRecord = await this.getFileByTransactionId(transactionId);
            if (!fileRecord) {
                throw new Error('File record not found');
            }

            if (fileRecord.status !== 'failed') {
                throw new Error('Only failed uploads can be retried');
            }

            // Get the file content from the original file path or storage
            const filePath = `uploads/${transactionId}`; // You might need to adjust this based on your storage setup
            let fileBuffer: Buffer;
            
            try {
                fileBuffer = fs.readFileSync(filePath);
            } catch (error) {
                throw new Error('Original file content not found');
            }

            // Prepare tags from metadata
            const tags = fileRecord.metadata.tags;

            // Try upload again
            const { transactionId: newTransactionId } = await this.uploadFile(
                fileBuffer,
                fileRecord.contentType,
                tags
            );

            // Update the record with new transaction ID and status
            const updatedRecord = await ArweaveFileModel.findOneAndUpdate(
                { transactionId },
                {
                    transactionId: newTransactionId,
                    status: 'processing',
                    permanentUrl: `https://${process.env.NODE_ENV === 'production' ? 'arweave.net' : 'localhost:1984'}/${newTransactionId}`
                },
                { new: true }
            );

            if (!updatedRecord) {
                throw new Error('Failed to update file record');
            }

            return updatedRecord;
        } catch (error) {
            console.error('Retry upload error:', error);
            throw new Error(`Failed to retry upload: ${error}`);
        }
    }

    static async getUserFiles(walletAddress: string, page: number = 1, limit: number = 10): Promise<{
        files: IArweaveFileDocument[];
        total: number;
        pages: number;
    }> {
        try {
            const total = await ArweaveFileModel.countDocuments({ uploadedBy: walletAddress });
            const files = await ArweaveFileModel.find({ uploadedBy: walletAddress })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            return {
                files,
                total,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw new Error(`Error getting user files: ${error}`);
        }
    }
}
