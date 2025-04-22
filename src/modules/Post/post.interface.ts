import { Document, Types } from "mongoose";

export interface IPost extends Document {
    image: string; 
    description: string;
    user: Types.ObjectId; 
}