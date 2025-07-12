import { Response } from "express"
import catchAsync from "../../utils/catchAsync"
import { CustomRequest } from "../../utils/customRequest"
import sendResponse from "../../utils/sendResponse"
import { acceptOfferIntoDB, createOfferIntoDB, getOffersFromDB } from "./offer.service"

export const createOffer = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const offerData = req.body;
    const resuult = await createOfferIntoDB(userId, offerData, req.body.image);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Offer created successfully",
        data: resuult,
    })
})
export const acceptOffer = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const offerData = req.body;
    const resuult = await acceptOfferIntoDB(userId, offerData);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Offer created successfully",
        data: resuult,
    })
})
export const getOffers = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const resuult = await getOffersFromDB(userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Offers retrieved successfully",
        data: resuult,
    })
})