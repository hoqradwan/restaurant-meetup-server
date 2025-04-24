import { Schema, model, Types } from 'mongoose';

const OfferSchema = new Schema(
    {
        image: { type: String, required: true },
        appointmentDate: { type: Date, required: true },
        time: { type: String, required: true },
        duration: { type: Number, required: true }, // duration in minutes
        expirationDateTime: { type: Date, required: true },
        agenda: { type: String, required: true },
        restaurant: { type: Types.ObjectId, ref: 'Restaurant', required: true },
        menuItem: { type: Types.ObjectId, ref: 'Menu', required: true },
        paymentType: {
            type: String,
            enum: ['Each pay their own', 'Organizer pay for all', 'Participants pay organizer'],
            required: true,
        },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'pending',
        },
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
        socialLinks: {
            fb: { type: String },
            insta: { type: String },
            linkedin: { type: String },
        },
    },
    { timestamps: true }
);

export const Offer = model('Offer', OfferSchema);