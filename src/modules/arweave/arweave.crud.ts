import Arweave from 'arweave';
import ArweaveFileModel from './arweave.model';
import { IArweaveFileDocument } from './arweave.interface';
import { config } from '../../config/environment';

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
            throw new Error(`Error calculating upload cost: ${error}`);
        }
    }

    static async uploadFile(
        fileBuffer: Buffer,
        contentType: string,
        tags: { name: string; value: string }[]
    ): Promise<{ transactionId: string }> {
        try {
            // Get wallet from config
            const wallet = await config.arweave.getWallet();

            // Create transaction
            const transaction = await this.arweave.createTransaction({
                data: fileBuffer
            }, wallet);

            // Add tags
            transaction.addTag('Content-Type', contentType);
            for (const tag of tags) {
                transaction.addTag(tag.name, tag.value);
            }

            // Sign transaction
            await this.arweave.transactions.sign(transaction, wallet);

            // Submit transaction
            const uploader = await this.arweave.transactions.getUploader(transaction);
            
            while (!uploader.isComplete) {
                await uploader.uploadChunk();
            }

            return {
                transactionId: transaction.id
            };
        } catch (error) {
            throw new Error(`Error uploading file: ${error}`);
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
