import { Document, Types } from "mongoose";

export interface IPost extends Document {
    image: string;
    description: string;
    user: Types.ObjectId;
    likes: [Types.ObjectId];
    comments: [{
        user: Types.ObjectId;
        message: string;
    }]
}