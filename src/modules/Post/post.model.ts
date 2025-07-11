import mongoose, { Schema, Types } from "mongoose";
import { IPost } from "./post.interface";

export interface IComment {
    user: Types.ObjectId;
    message: string;
}

const postSchema = new Schema<IPost>({
    image: {
        type: String, // URL or path to photo
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: Types.ObjectId,
            required: true,
            ref: 'User'
        },
        message: {
            type: String,
            required: true
        }
    }]
}, { timestamps: true });

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);