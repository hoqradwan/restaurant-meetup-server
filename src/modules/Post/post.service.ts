import { error } from "winston";
import { UserModel } from "../user/user.model";
import { IPost } from "./post.interface";
import { Post } from "./post.model";

export const createPostIntoDB = async (userId: string, postData: Partial<IPost>, image: string) => {
    const { description } = postData;
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const post = await Post.create({ image, user: userId, description });
    return post;
};

export const getAllPostsFromDB = async () => {
    const posts = await Post.find()
        .populate({
            path: 'user',
            select: 'firstName lastName image'
        })
        .populate({
            path: 'comments.user',
            select: 'firstName lastName image'
        });
    return posts;
}

export const likeAPostIntoDB = async (userId: string, postId: string) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    // $addToSet adds userId only if it's not already present in the likes array (prevents duplicates).
    // $push would add userId to the likes array even if it already exists (allows duplicates).
    const like = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
    );
    return like;
}