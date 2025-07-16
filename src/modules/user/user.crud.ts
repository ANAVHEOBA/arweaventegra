import UserModel from './user.model';
import { IUser, IUserDocument } from './user.interface';
import { JWTService } from '../../services/jwt.service';
import { HydratedDocument } from 'mongoose';

export class UserCrud {
    static async createUser(walletAddress: string): Promise<HydratedDocument<IUserDocument>> {
        try {
            const user = await UserModel.create({
                walletAddress: walletAddress.toLowerCase(),
                nonce: JWTService.generateNonce()
            });
            return user;
        } catch (error) {
            throw new Error(`Error creating user: ${error}`);
        }
    }

    static async findUserByWallet(walletAddress: string): Promise<HydratedDocument<IUserDocument> | null> {
        try {
            return await UserModel.findOne({ walletAddress: walletAddress.toLowerCase() });
        } catch (error) {
            throw new Error(`Error finding user: ${error}`);
        }
    }

    static async updateUserNonce(walletAddress: string): Promise<HydratedDocument<IUserDocument> | null> {
        try {
            const user = await UserModel.findOne({ walletAddress: walletAddress.toLowerCase() });
            if (!user) return null;

            user.nonce = JWTService.generateNonce();
            user.lastLogin = new Date();
            await user.save();
            
            return user;
        } catch (error) {
            throw new Error(`Error updating user nonce: ${error}`);
        }
    }

    static async updateUser(walletAddress: string, updateData: Partial<IUser>): Promise<HydratedDocument<IUserDocument> | null> {
        try {
            return await UserModel.findOneAndUpdate(
                { walletAddress: walletAddress.toLowerCase() },
                { ...updateData, lastLogin: new Date() },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating user: ${error}`);
        }
    }

    static async deleteUser(walletAddress: string): Promise<boolean> {
        try {
            const result = await UserModel.deleteOne({ walletAddress: walletAddress.toLowerCase() });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error deleting user: ${error}`);
        }
    }

    static async getAllUsers(page: number = 1, limit: number = 10): Promise<{
        users: HydratedDocument<IUserDocument>[];
        total: number;
        pages: number;
    }> {
        try {
            const total = await UserModel.countDocuments();
            const users = await UserModel.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });

            return {
                users,
                total,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw new Error(`Error getting users: ${error}`);
        }
    }
}
