import mongoose, { Schema, Model } from "mongoose";
import { IPayment } from "./payment.interface"; // Adjust the import path as necessary

const paymentSchema: Schema<IPayment> = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    bookingId:{
      type: Schema.Types.ObjectId,
      ref: "Booking", // Adjust the ref according to your booking model
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User", // Adjust the ref according to your user model
    },
    
    amount: {
      type: Number,
      required: true,
    },
    paymentData: {
      type: Object,
      required: true,
    },
    paymentDate:{
      type: Date,
      default: Date.now, // Automatically sets to current date if not provided
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      required: true,
    },
    paymentType:{
      type: String,
      enum: [ "online","cash"],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
