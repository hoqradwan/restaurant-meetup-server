import { model, Schema } from "mongoose";

const walletSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    totalBalance: {
        type: Number,
        default: 0,
    },
    totalWithdrawal:
    {
        type: Number,
        default: 0,
    },
    type: {
        type: String,
        enum: ["restaurant", "user"],
        default: "user",
    }
}, { timestamps: true });

const Wallet = model("Wallet", walletSchema);
export default Wallet;