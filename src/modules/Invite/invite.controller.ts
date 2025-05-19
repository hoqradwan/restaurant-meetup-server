import { Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";
import { acceptInviteInDB, createInviteIntoDB } from "./invite.service";

export const createInvite = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const formattedInviteData = JSON.parse(req.body.data);
   
    const result = await createInviteIntoDB(formattedInviteData, userId, req.body.image);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Invite created successfully",
        data: result,
    });
});


export const acceptInvite = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const InviteData  = req.body;

    // Assuming you have a function to handle the acceptance of the invite
    const result = await acceptInviteInDB(InviteData, userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Invite accepted successfully",
        data: result,
    });
});
