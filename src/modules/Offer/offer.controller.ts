import { Response } from "express"
import catchAsync from "../../utils/catchAsync"
import { CustomRequest } from "../../utils/customRequest"
import sendResponse from "../../utils/sendResponse"
import { createOfferIntoDB } from "./offer.service"

export const createOffer = catchAsync(async (req: CustomRequest, res: Response) => {
   const resuult = await createOfferIntoDB(req.body)
   sendResponse(res, {
       statusCode: 200,
       success: true,
       message: "Offer created successfully",
       data: resuult,})
})