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
    duration: { type: Number}, // Duration in minutes
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
    orderLimitPerParticipant: { 
        type: Number, 
        required: function(this: any) {
            return this.contribution === 'Organizer pay for all';
        },
    },
    minParticipants: { type: Number, required: true },
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

// Custom validation can also be added if needed
// Example for validation if the contribution is "Organizer pay for all"
OfferSchema.path('orderLimitPerParticipant').validate(function(value) {
    if (this.contribution === 'Organizer pay for all' && !value) {
        return false; // 'orderLimitPerParticipant' is required
    }
    return true; // Pass validation
}, 'Order limit per participant is required when "Organizer pay for all" is selected');

export const Offer = model('Offer', OfferSchema);
