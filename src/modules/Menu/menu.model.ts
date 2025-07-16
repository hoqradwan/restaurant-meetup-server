import mongoose, { Schema } from "mongoose";

const menuschema = new Schema({
    name:{
        type: String,
        required: true,
    },
    image: {
        type: String, // URL or path to photo
        required: true,
        default : "",
    },
    description: {
        type: String,
        default : "",
    },
    price: {
        type: Number,
        required: true,
        default : 0,
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true,
        default : null,
    },
}, { timestamps: true });
export const Menu =  mongoose.model("Menu", menuschema); 
