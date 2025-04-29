import { RestaurantModel } from "../user/user.model";
import { Menu } from "./menu.model";

export const createMenuIntoDB = async (menuData: any, restaurantId: string) => {
    const isRestaurantExists = await RestaurantModel.findById(restaurantId);
    if(!isRestaurantExists) {
        throw new Error("Restaurant not found");   
    }
    const isMenuExists = await Menu.findOne({name: menuData.name, restaurant: restaurantId});
    if (isMenuExists) {
        throw new Error("Menu already exists for this restaurant");
    }
    menuData.restaurant = restaurantId; // Assign the restaurant ID to the menu data
    const menu = await Menu.create(menuData);
    return menu;
}