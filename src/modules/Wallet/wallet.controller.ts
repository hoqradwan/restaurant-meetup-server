import { Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";
import { getMyWalletFromDB, rechargeBalanceIntoDB, withdrawBalanceIntoDB } from "./wallet.service";

export const getMyWallet = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId, role } = req.user;
    const result = await getMyWalletFromDB(userId, role);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Wallet retrieved successfully",
        data: result
    });
});
export const rechargeBalance = catchAsync(async (req: CustomRequest, res: Response) => {
    const paymentData = req.body;
    const { id: userId, role } = req.user;
    const result = await rechargeBalanceIntoDB(userId, role, paymentData);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Balance recharged successfully",
        data: result
    });
});
export const withdrawBalance = catchAsync(async (req: CustomRequest, res: Response) => {
    const paymentData = req.body;
    const { id: userId, role } = req.user;
    const result = await withdrawBalanceIntoDB(userId, role, paymentData);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Balance withdrawn successfully",
        data: result
    });
});