import { Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";
import { createPostIntoDB } from "./post.service";
import { IPost } from "./post.interface";
import AppError from "../../errors/AppError";

export const createPost = catchAsync(async (req: CustomRequest, res: Response) => {
    // 1. Get authenticated user
    const userId = req.user?.id; // Using 'id' from your JWT
    if (!userId) {
        throw new AppError(401, "Authentication required");
    }
    const formattedData = JSON.parse(req.body.data);

    // 3. Parse the description - handle both direct and JSON formats
    const postData = {
        description: formattedData.description || req.body.description,
        image: req.body.image,
        user: userId,
    }

    // 5. Create post
    const result = await createPostIntoDB(postData as IPost);

    // 6. Send response
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Post created successfully",
        data: {
            ...result.toObject(),
            imageUrl: `${req.protocol}://${req.get('host')}/${req.body.image.replace(/\\/g, '/')
                }`
        }
    });
});