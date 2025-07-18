import { IPayment } from "../payment/payment.interface";
import { PaymentModel } from "../payment/payment.model";
import { RestaurantModel, UserModel } from "../user/user.model"
import Wallet from "./wallet.model";
import mongoose from "mongoose";

export const getMyWalletFromDB = async (userId: string, role: string) => {
    let user;
    if (role === "user") {
        user = await UserModel.findById(userId);
    } else if (role === "restaurant") {
        user = await RestaurantModel.findById(userId);
    }
    if (!user) {
        throw new Error("User not found")
    }
    const wallet = await Wallet.findOne({ user: userId })
    return wallet
}


export const rechargeBalanceIntoDB = async (userId: string, role: string, paymentData: Partial<IPayment>) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, transactionId } = paymentData;
        let user;
        if (role === "user") {
            user = await UserModel.findById(userId).session(session);
        } else if (role === "restaurant") {
            user = await RestaurantModel.findById(userId).session(session);
        }
        if (!user) {
            throw new Error("User not found");
        }
        let payment: any = {
            transactionId,
            paymentType: "online",
            user: userId,
            paymentData: {},
            paymentDate: new Date(),
            status: 'completed',
            isDeleted: false,
        };

        // Create the payment record
        const createdPayment = await PaymentModel.create([payment], { session });
        if (!createdPayment || createdPayment.length === 0) {
            throw new Error('Payment creation failed');
        }

        // Find or create wallet for the user
        let wallet = await Wallet.findOne({ user: userId }).session(session);
        if (!wallet) {
            wallet = new Wallet({ user: userId, type: role });
        }

        wallet.totalBalance += amount ?? 0;
        await wallet.save({ session });

        await session.commitTransaction();
        session.endSession();

        return wallet;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}
export const withdrawBalanceIntoDB = async (userId: string, role: string, paymentData: Partial<IPayment>) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, transactionId } = paymentData;

        let user;
        if (role === "user") {
            user = await UserModel.findById(userId).session(session);
        } else if (role === "restaurant") {
            user = await RestaurantModel.findById(userId).session(session);
        }
        if (!user) {
            throw new Error("User not found");
        }
        let payment: any = {
            transactionId,
            paymentType: "online",
            user: userId,
            paymentData: {},
            paymentDate: new Date(),
            status: 'completed',
            isDeleted: false,
        };

        // Create the payment record
        const createdPayment = await PaymentModel.create([payment], { session });
        if (!createdPayment || createdPayment.length === 0) {
            throw new Error('Payment creation failed');
        }

        // Find or create wallet for the user
        let wallet = await Wallet.findOne({ user: userId }).session(session);
        if (!wallet) {
            wallet = new Wallet({ user: userId, type: role });
        }

        wallet.totalBalance -= amount ?? 0;
        wallet.totalWithdrawal += amount ?? 0;
        await wallet.save({ session });

        await session.commitTransaction();
        session.endSession();

        return wallet;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}