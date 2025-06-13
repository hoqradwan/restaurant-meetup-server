import { Document, Types } from "mongoose";

export type IPayment = {
  transactionId: string;
  user: Types.ObjectId;
  amount: number;
  paymentData: object;
  status: "completed" | "pending" | "failed";
  isDeleted: boolean;
} & Document;

export type IPaymentResult = {
  transactionId: string;
  amount: number;
  userName: string;
  createdAt: string;
};
