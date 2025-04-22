import mongoose, { Schema } from "mongoose";
import { IPost } from "./post.interface";

const postSchema = new Schema<IPost>({
    image : {
        type: String, // URL or path to photo
        required: true,
    },
    description : {
        type: String,
        required: true,
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
})

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);