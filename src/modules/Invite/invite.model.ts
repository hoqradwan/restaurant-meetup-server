import { Schema, model, Types } from 'mongoose';

const InviteSchema = new Schema({
    organizer: { type: Types.ObjectId, required: true, ref: 'User' },
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
    participants: [{
        user: { type: Types.ObjectId, ref: 'User', required: true },
        selectedMenuItems: [{ type: Types.ObjectId, ref: 'Menu', required: true, default: [] }],
    }],
    restaurant: { type: Types.ObjectId, ref: 'Restaurant', required: true },
}, { timestamps: true });

const Invite = model('Invite', InviteSchema);

export default Invite;
