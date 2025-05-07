import { model, Schema } from 'mongoose';
export const UserInvitationProcessSchema = new Schema({
    commonDetailsOfferOrInvite: { type: Schema.Types.ObjectId, required: true, ref: 'CommonDetailsOfferOrInvite' },
    participantsInProcess: [
        {
            user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
            amountToPay: { type: Number, required: true, default: 0 },
            status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], required: true, default: 'Pending' }
        }],
}, { timestamps: true });
export const UserInvitationProcessModel = model('UserInvitationProcess', UserInvitationProcessSchema);