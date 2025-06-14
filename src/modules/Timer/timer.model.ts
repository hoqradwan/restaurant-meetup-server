import { model, Schema } from "mongoose";

const timerSchema = new Schema({
    meetupId: { type: Schema.Types.ObjectId, required: true, ref: "Meetup" },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date, required: true, default: Date.now },
    duration: { type: Number, required: true, default: 0 }, // Duration in seconds
    bookingType: { type: String, enum: ["invite", "offer", "booking"], required: true, default: "booking" },
}, {
    timestamps: true
})

export const Timer = model("Timer", timerSchema);