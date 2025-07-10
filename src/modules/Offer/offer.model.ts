import { Schema, model, Types } from 'mongoose';

const OfferSchema = new Schema({
    organizer: { type: Types.ObjectId, required: true, ref: 'User' },
    media: {
        url: { type: String, required: true, default: "" },
        type: { type: String, enum: ['image', 'video'], required: true, default: 'image' }
    },
    appointmentDate: { type: Date, required: true },
    description: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    expirationDate: { type: Date, required: true },
    expirationTime: { type: String, required: true },
    agenda: { type: String, required: true },
    contribution: {
        type: String,
        enum: ['Each pay their own', 'Organizer pay for all'],
        required: true,
    },
    extraChargeType: {
        type: String,
        enum: ['Organizer pays participants', 'Participants pay organizer'],
        required: true,
    },
    extraChargeAmount: { type: Number, required: true, default: 0 },
    ticketNumber: { type: String, default: "" },
    status: {
        type: String,
        enum: ['Pending', 'Ongoing', 'Completed', 'Cancelled'],
        required: true,
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
        interests: [{ type: String, required: true }],
    },
    participants: [{
        user: { type: Types.ObjectId, ref: 'User', required: true },
        selectedMenuItems: [{ type: Types.ObjectId, ref: 'Menu', required: true, default: [] }],
    }],
    restaurant: { type: Types.ObjectId, ref: 'Restaurant', required: true },

}, { timestamps: true });



export const Offer = model('Offer', OfferSchema);
