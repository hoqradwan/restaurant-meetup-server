import { Schema, model, Types } from 'mongoose';

const InviteSchema = new Schema({
    CommonDetailsOfferOrInvite: { type: Types.ObjectId, ref: 'CommonDetailsOfferOrInvite', required: true },
    participants: [{
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    user: { type: Types.ObjectId, ref: 'Restaurant', required: true },
   
}, { timestamps: true });

const Invite = model('Invite', InviteSchema);

export default Invite;
