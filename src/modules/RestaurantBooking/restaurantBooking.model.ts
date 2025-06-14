import { model, Schema } from "mongoose";

const restaurantBookingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    restaurant: { type: Schema.Types.ObjectId, required: true, ref: "restaurant" },
    menuItems: [{ type: Schema.Types.ObjectId, required: true, ref: "Menu" }],
    dateTime: { type: Date, required: true, default: "" },
    numberOfPeople: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['Pending', 'Running', 'Completed'], required: true, default: 'Pending' },
    totalPrice: { type: Number, required: true }
}, {
    timestamps: true
})

export const RestaurantBooking = model("RestaurantBooking", restaurantBookingSchema);