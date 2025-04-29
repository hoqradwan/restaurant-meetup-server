import { Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";
import { createInviteIntoDB } from "./invite.service";


export const createInvite = catchAsync(async(req : CustomRequest, res : Response) => {
        const { id: restaurantId } = req.user;
        const inviteData = req.body;
        const result = await createInviteIntoDB(inviteData, restaurantId);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Invite created successfully",
            data: result,
        });
    });


