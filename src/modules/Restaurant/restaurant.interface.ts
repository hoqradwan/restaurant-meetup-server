import { Types } from "mongoose";



export interface IRestaurant extends Document {
    user: Types.ObjectId;
    menu: Types.ObjectId;
}
