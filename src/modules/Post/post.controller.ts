import { Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";
import { createPostIntoDB, getAllPostsFromDB, likeAPostIntoDB } from "./post.service";
import { IPost } from "./post.interface";
import AppError from "../../errors/AppError";

export const createPost = catchAsync(async (req: CustomRequest, res: Response) => {
    // 1. Get authenticated user
    const userId = req.user?.id; // Using 'id' from your JWT

    const postData = req.body;
    const image =
    req.files &&
    typeof req.files === "object" &&
    "image" in req.files &&
    Array.isArray((req.files as { [fieldname: string]: Express.Multer.File[] })["image"])
      ? ((req.files as { [fieldname: string]: (Express.Multer.File & { location?: string })[] })["image"][0].location ?? null)
      : null;
    // 3. Parse the description - handle both direct and JSON formats

    
    // 5. Create post
    const result = await createPostIntoDB( userId, postData as Partial<IPost> , image as string);

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
export const getAllPosts = catchAsync(async (req: CustomRequest, res: Response) => {
    // 1. Get authenticated user
    const {id :userId} = req.user; // Using 'id' from your JWT

  const result = await getAllPostsFromDB();
    // 6. Send response
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Posts retrieved successfully",
        data: result
    });
});
export const likeAPost = catchAsync(async (req: CustomRequest, res: Response) => {
    const postId = req.params.postId;
    // 1. Get authenticated user
    const {id :userId} = req.user; // Using 'id' from your JWT

  const result = await likeAPostIntoDB(userId,postId);
    // 6. Send response
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Post liked successfully",
        data: result
    });
});