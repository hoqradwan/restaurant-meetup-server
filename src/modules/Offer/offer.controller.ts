import { Response } from "express"
import catchAsync from "../../utils/catchAsync"
import { CustomRequest } from "../../utils/customRequest"
import sendResponse from "../../utils/sendResponse"
import { acceptOfferIntoDB, createOfferIntoDB, getOffersFromDB } from "./offer.service"
import { getFileTypeCategory, validateFileSize } from "../../middlewares/fileUploadNormal"
import path from "path";

export const createOffer = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const offerData = req.body;
     // Get uploaded media file
    const mediaFile = req.files && 
        typeof req.files === "object" && 
        "media" in req.files && 
        Array.isArray((req.files as { [fieldname: string]: Express.Multer.File[] })["media"])
        ? ((req.files as { [fieldname: string]: (Express.Multer.File & { location?: string })[] })["media"][0])
        : null;
    let fileCategory;
    // Validate file type if provided
    if (mediaFile) {
        const extName = path.extname(mediaFile.originalname).toLowerCase();
         fileCategory = getFileTypeCategory(extName);
        
        if (!fileCategory || (fileCategory !== "image" && fileCategory !== "video")) {
            return res.status(400).json({
                success: false,
                message: "Only image and video files are allowed for media field"
            });
        }
        
        // Additional size validation
        if (!validateFileSize(mediaFile)) {
            return res.status(400).json({
                success: false,
                message: `File size exceeds maximum allowed size for ${fileCategory} files`
            });
        }
    }
    
    // Extract the S3 URL from the uploaded file
    const mediaUrl = mediaFile?.location || null;

    const resuult = await createOfferIntoDB(userId, offerData, mediaUrl as string, fileCategory as string);
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