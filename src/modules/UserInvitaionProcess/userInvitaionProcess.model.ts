import { model, Schema } from 'mongoose';
export const UserInvitationProcessSchema = new Schema({
    invite: { type: Schema.Types.ObjectId, required: true, ref: 'Invite' },
    participantsInProcess: [
        {
            user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
            amountToPay: { type: Number, required: true, default: 0 },
            extraChargeAmountToPay: { type: Number, required: true, default: 0 },
            extraChargeAmountToGet: { type: Number, required: true, default: 0 },
            status: { type: String, enum: ['Pending', 'Accepted','Paid', 'Declined'], required: true, default: 'Pending' }
        }],
        //  after accepting the invite 
}, { timestamps: true });
export const UserInvitationProcessModel = model('UserInvitationProcess', UserInvitationProcessSchema);

