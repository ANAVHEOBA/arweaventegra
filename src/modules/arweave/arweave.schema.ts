import { Schema } from 'mongoose';
import { IArweaveFileDocument } from './arweave.interface';

const ArweaveFileSchema = new Schema<IArweaveFileDocument>({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'confirmed', 'failed'],
        default: 'pending'
    },
    contentType: {
        type: String,
        required: true
    },
    cost: {
        ar: {
            type: Number,
            required: true
        },
        usd: {
            type: Number,
            required: true
        },
        bytes: {
            type: Number,
            required: true
        }
    },
    metadata: {
        title: String,
        description: String,
        tags: [{
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }]
    },
    permanentUrl: String
}, {
    timestamps: true
});

// Indexes
ArweaveFileSchema.index({ createdAt: -1 });
ArweaveFileSchema.index({ status: 1 });
ArweaveFileSchema.index({ 'metadata.tags.name': 1, 'metadata.tags.value': 1 });

export default ArweaveFileSchema;
