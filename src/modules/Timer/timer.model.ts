import { model, Schema } from "mongoose";

const timerSchema = new Schema({
    meetupId: { type: Schema.Types.ObjectId, required: true, refPath: "meetupModel" },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date, required: true, default: Date.now },
    duration: { type: Number, required: true, default: 0 }, // Duration in seconds
    meetupModel: { type: String, enum: ["invite", "offer", "booking"], required: true, default: "booking" },
}, {
    timestamps: true
})

export const Timer = model("Timer", timerSchema);