import { Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";
import { acceptInviteInDB, createInviteIntoDB } from "./invite.service";
import { getFileTypeCategory, validateFileSize } from "../../middlewares/fileUploadNormal";
import path from "path";
// export const createInvite = catchAsync(async (req: CustomRequest, res: Response) => {
//     const { id: userId } = req.user;
//     const inviteData = req.body;
//     const image =
//         req.files &&
//             typeof req.files === "object" &&
//             "image" in req.files &&
//             Array.isArray((req.files as { [fieldname: string]: Express.Multer.File[] })["image"])
//             ? ((req.files as { [fieldname: string]: (Express.Multer.File & { location?: string })[] })["image"][0].location ?? null)
//             : null;
//     const result = await createInviteIntoDB(inviteData, userId, image as string);
//     sendResponse(res, {
//         statusCode: 201,
//         success: true,
//         message: "Invite created successfully",
//         data: result,
//     });
// });

export const createInvite = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const inviteData = req.body;
    
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


    // Create invite with media URL
    const result = await createInviteIntoDB(inviteData, userId, mediaUrl as string, fileCategory as string);
    
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Invite created successfully",
        data: result,
    });
});
export const acceptInvite = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const InviteData = req.body;

    // Assuming you have a function to handle the acceptance of the invite
    const result = await acceptInviteInDB(InviteData, userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Invite accepted successfully",
        data: result,
    });
});



