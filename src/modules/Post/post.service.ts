import { IPost } from "./post.interface";
import { Post } from "./post.model";

export const createPostIntoDB = async (postData: IPost) => {
    const post = await Post.create(postData);
    return post;
};