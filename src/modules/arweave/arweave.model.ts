import { model } from 'mongoose';
import { IArweaveFileDocument } from './arweave.interface';
import ArweaveFileSchema from './arweave.schema';

const ArweaveFileModel = model<IArweaveFileDocument>('ArweaveFile', ArweaveFileSchema);

export default ArweaveFileModel;
