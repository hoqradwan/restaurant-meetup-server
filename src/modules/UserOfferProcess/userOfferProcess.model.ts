import { model, Schema } from 'mongoose';
export const UserOfferProcessSchema = new Schema({
    offer: { type: Schema.Types.ObjectId, required: true, ref: 'Offer' },
    participantsInProcess: [
        {
            user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
            amountToPay: { type: Number, required: true, default: 0 },
            organizerMenuItemsToPay: { type: Number, required: true, default: 0 },
            participantMenutItemsToPay :{type: Number, required: true, default: 0},
            extraChargeAmountToPay: { type: Number, required: true, default: 0 },
            extraChargeAmountToGet: { type: Number, required: true, default: 0 },
            status: { type: String, enum: ['Pending', 'Accepted','Processing','Paid', 'Declined'], required: true, default: 'Pending' }
        }],
}, { timestamps: true });
export const UserOfferProcessModel = model('UserOfferProcess', UserOfferProcessSchema);

