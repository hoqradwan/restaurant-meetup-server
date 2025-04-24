import { Schema, model, Document } from 'mongoose';
import { IInterest } from './interest.interface';

const InterestSchema = new Schema<IInterest>(
    {
        name: { type: String, required: true, unique: true, trim: true },
    }
);

export const Interest = model<IInterest>('Interest', InterestSchema);

