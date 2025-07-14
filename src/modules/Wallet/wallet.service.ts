import { RestaurantModel, UserModel } from "../user/user.model"
import Wallet from "./wallet.model";

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


export const rechargeBalanceIntoDB = async (userId: string, role: string, amount : number) => {
    let user;
    if (role === "user") {
        user = await UserModel.findById(userId);
    } else if (role === "restaurant") {
        user = await RestaurantModel.findById(userId);
    }
    if (!user) {
        throw new Error("User not found")
    }
    
    // Find or create wallet for the user
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        wallet = new Wallet({ user: userId, type: role });
    }

    // Recharge balance logic (for example, adding a fixed amount)
    wallet.totalBalance += amount; // Example recharge amount
    await wallet.save();

    return wallet;
}
export const withdrawBalanceIntoDB = async (userId: string, role: string, amount : number) => {
    let user;
    if (role === "user") {
        user = await UserModel.findById(userId);
    } else if (role === "restaurant") {
        user = await RestaurantModel.findById(userId);
    }
    if (!user) {
        throw new Error("User not found")
    }
    
    // Find or create wallet for the user
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        wallet = new Wallet({ user: userId, type: role });
    }

    // Recharge balance logic (for example, adding a fixed amount)
    wallet.totalBalance -= amount; // Example recharge amount
    wallet.totalWithdrawal += amount; // Example recharge amount
    await wallet.save();

    return wallet;
}