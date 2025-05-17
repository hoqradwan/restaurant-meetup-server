import { Schema, model, Types } from 'mongoose';

const InviteSchema = new Schema({
    organizer: { type: Types.ObjectId, required: true, ref: 'User' },
    commonDetailsOfferOrInvite: { type: Types.ObjectId, ref: 'CommonDetailsOfferOrInvite', required: true },
    participants: [{
        user: { type: Types.ObjectId, ref: 'User', required: true },
        selectedMenuItems: [{ type: Types.ObjectId, ref: 'Menu', required: true, default: [] }],
    }],
    restaurant: { type: Types.ObjectId, ref: 'Restaurant', required: true },
}, { timestamps: true });

const Invite = model('Invite', InviteSchema);

export default Invite;
