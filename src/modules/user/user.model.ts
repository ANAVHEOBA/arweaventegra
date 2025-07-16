import { model } from 'mongoose';
import { IUserDocument } from './user.interface';
import UserSchema from './user.schema';

const UserModel = model<IUserDocument>('User', UserSchema);

export default UserModel;
