import { Schema, model } from 'mongoose';
import { IRestaurant } from './restaurant.interface';


const RestaurantSchema = new Schema<IRestaurant>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menu: [{ type: Schema.Types.ObjectId, ref: 'Menu', required: true }],
});

const Restaurant = model<IRestaurant>('Restaurant', RestaurantSchema);

export default Restaurant;