import { Schema, model, Types } from 'mongoose';

const CommonDetailsOfferOrInviteSchema = new Schema({
    image: { type: String, required: true, default: "" },
    appointmentDate: { type: Date, required: true },
    description: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    expirationDate: { type: Date, required: true },
    expirationTime: { type: String, required: true },
    agenda: { type: String, required: true },
    fbUrl: { type: String, required: true, default: "" },
    instaUrl: { type: String, required: true, default: "" },
    linkedinUrl: { type: String, required: true, default: "" },
    contribution: {
        type: String,
        enum: ['Each pay their own', 'Organizer pay for all', 'Participants pay organizer'],
        required: true,
    },
    extraChargeType: {
        type: String,
        enum: ['Organizer Pay Participant', 'Participant Pays Organizer'],
        required: true,
    },
    extraChargeAmount: { type: Number, required: true, default: 0 },
    ticketNumber: { type: String, required: true, default: "" },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        required: true,
    },
    type : {
        type: String,
        enum: ['Offer', 'Invite'],
        required: true,
    },
    
}, { timestamps: true });

// Export the model
export const CommonDetailsOfferOrInvite = model('CommonDetailsOfferOrInvite', CommonDetailsOfferOrInviteSchema);
