import { Schema, model, Types } from 'mongoose';

const OfferSchema = new Schema({
    organizer: { type: Types.ObjectId, required: true, ref: 'User' },
    CommonDetailsOfferOrInvite: { type: Types.ObjectId, ref: 'CommonDetailsOfferOrInvite', required: true },
    audienceDetails: {
        age: { type: Number, required: true },
        education: { type: String, required: true },
        race: { type: String, required: true },
        profession: { type: String, required: true },
        language: { type: String, required: true },
        height: { type: Number, required: true }, // height in cm
        gender: { type: String, required: true },
        weight: { type: Number, required: true }, // weight in kg
        religion: { type: String, required: true },
        interest: { type: String, required: true },
    },
    participants: [{
        user: { type: Types.ObjectId, ref: 'User', required: true },
        selectedMenuItems: [{ type: Types.ObjectId, ref: 'Menu', required: true, default: [] }],
    }],
    restaurant: { type: Types.ObjectId, ref: 'Restaurant', required: true },

}, { timestamps: true });

export const Offer = model('Offer', OfferSchema);
