import { Document, Types } from "mongoose";

export type IPayment = {
  transactionId: string;
  user: Types.ObjectId;
  amount: number;
  paymentData: object;
  status: "completed" | "pending" | "failed";
  isDeleted: boolean;
  paymentType: "online" | "cash";
  bookingId: Types.ObjectId; // <-- Add bookingId field
  paymentDate: Date; // <-- Add paymentDate field
  createdAt?: any; // <-- Add createdAt field
  updatedAt?: any; // <-- Add updatedAt field
} & Document;

export type IPaymentResult = {
  transactionId: string;
  amount: number;
  userName: string;
  email: string;
  createdAt: string;
};
