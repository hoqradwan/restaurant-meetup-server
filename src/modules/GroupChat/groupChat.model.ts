import { model, Schema } from "mongoose";

const groupChatSchema = new Schema({
    participants :  [{type : Schema.Types.ObjectId, required : true , ref: "User"}],
    restaurant : {type : Schema.Types.ObjectId, required : true , ref: "restaurant"}   
},{
    timestamps : true
})

export const GroupChat = model("GroupChat", groupChatSchema);