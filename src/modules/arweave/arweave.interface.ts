import { Document } from 'mongoose';

export interface IArweaveFile {
    transactionId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedBy: string; // wallet address
    status: 'pending' | 'processing' | 'confirmed' | 'failed';
    contentType: string;
    cost: {
        ar: number;      // cost in AR tokens
        usd: number;     // cost in USD
        bytes: number;   // file size in bytes
    };
    metadata: {
        title?: string;
        description?: string;
        tags: Array<{ name: string; value: string }>;
    };
    createdAt: Date;
    updatedAt: Date;
    permanentUrl?: string;
}

export interface IArweaveFileDocument extends IArweaveFile, Document {
    _id: string;
}
