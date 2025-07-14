import { model, Schema } from "mongoose";

const groupChatSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
    restaurant: { type: Schema.Types.ObjectId, required: true, ref: "restaurant" },
    invite: { type: Schema.Types.ObjectId, ref: "Invite" },
    offer: { type: Schema.Types.ObjectId, ref: "Offer" },
}, {
    timestamps: true
});

export const GroupChat = model("GroupChat", groupChatSchema);