import { Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";
import { createMenuIntoDB } from "./menu.service";

export const createMenu = catchAsync(async (req: CustomRequest, res: Response) => {
    const {id : restaurantId} = req.user;
    const result = await createMenuIntoDB(req.body, restaurantId);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Menu created successfully",
        data: result,
    });
}) 