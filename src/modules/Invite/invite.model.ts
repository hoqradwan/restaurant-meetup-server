import { Schema, model, Types } from 'mongoose';

const InviteSchema = new Schema(
    {
        image: { type: String, required: true , default : ""},
        appointmentDate: { type: Date, required: true },
        time: { type: String, required: true },
        duration: { type: Number, required: true }, // Duration in minutes
        expirationDate: { type: Date, required: true },
        expirationTime: { type: String, required: true },
        agenda: { type: String, required: true },
        fbUrl: { type: String, required: true, default : "" },
        instaUrl: { type: String, required: true, default : "" },
        linkedinUrl: { type: String, required: true, default : "" },
        participants: [
            {
                type: Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        restaurant: {
            type: Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        user: {
            type: Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        menuItems: [{
            type: Types.ObjectId,
            ref: 'Menu',
            required: true,
        }],
        contribution: {
            type: String,
            enum: ['Each pay their own', 'Organizer pay for all', 'Participants pay organizer'],
            required: true,
        },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Cancelled'],
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Invite = model('Invite', InviteSchema);

export default Invite;