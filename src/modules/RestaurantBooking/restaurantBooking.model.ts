import { model, Schema } from "mongoose";

const restaurantBookingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    restaurant: { type: Schema.Types.ObjectId, required: true, ref: "restaurant" },
    menuItems: [{ type: Schema.Types.ObjectId, required: true, ref: "Menu" }],
    dateTime: { type: Date, required: true, default: "" },
    totalPrice: { type: Number, required: true }
}, {
    timestamps: true
})

export const RestaurantBooking = model("RestaurantBooking", restaurantBookingSchema);