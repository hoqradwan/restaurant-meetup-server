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
            path: 'likes',
            select: 'firstName lastName image'
        })
        .populate({
            path: 'comments.user',
            select: 'firstName lastName image'
        });

    // Move user data from comments.user to comments, flattening the structure
    const postsWithFlattenedComments = posts.map(post => {
        const postObj = post.toObject();
        const comments = postObj.comments?.map((comment: any) => ({
            ...comment.user, // spread user fields directly into comment object
            message: comment.message,
            _id: comment._id
        })) || [];
        return {
            ...postObj,
            comments,
            likeCount: postObj.likes ? postObj.likes.length : 0,
            commentCount: comments.length
        };
    });

    return postsWithFlattenedComments;
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
export const commentAPostIntoDB = async (userId: string, postId: string, message : string) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    // $addToSet adds userId only if it's not already present in the likes array (prevents duplicates).
    // $push would add userId to the likes array even if it already exists (allows duplicates).
    const comment = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { comments: {user: userId, message} } },
        { new: true }
    );
    return comment;
}