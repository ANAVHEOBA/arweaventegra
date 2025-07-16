import { Document } from 'mongoose';

export interface IUser {
    walletAddress: string;
    nonce: string;  // For wallet signature verification
    createdAt: Date;
    lastLogin: Date;
}

export interface IUserDocument extends IUser, Document {
    _id: string;
}
