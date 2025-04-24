import mongoose, { Schema } from "mongoose";

const menuschema = new Schema({
    name:{
        type: String,
        required: true,
    },
    image: {
        type: String, // URL or path to photo
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },

    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        default : null,
    },
}, { timestamps: true });
export const Menu =  mongoose.model("Menu", menuschema); 
