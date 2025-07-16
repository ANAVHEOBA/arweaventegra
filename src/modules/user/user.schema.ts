import { Schema } from 'mongoose';
import { IUserDocument } from './user.interface';

const UserSchema = new Schema<IUserDocument>({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    nonce: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

export default UserSchema;
