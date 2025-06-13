import { Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";

export const createRestaurant = catchAsync(async (req, res) => {
    // const { name } = req.body;
    // const interest = await Interest.create({ name });
    // return interest;
})
