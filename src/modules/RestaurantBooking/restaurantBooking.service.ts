import mongoose from 'mongoose';
import { RestaurantModel, UserModel } from '../user/user.model';
import { Menu } from '../Menu/menu.model';
import { RestaurantBooking } from './restaurantBooking.model';

export const getAllRestaurantBookingsFromDB = async(userId : string) =>{
    const restaurant = await RestaurantModel.findById(userId);
    if(!restaurant){
        throw new Error("Restaurant not found");
    }
    const restaurantBookings = await RestaurantBooking.find();
    return restaurantBookings;
}

export const bookRestaurantIntoDB = async (userId: string, bookingData: any) => {
  const { restaurant, menuItems, dateTime } = bookingData;

  // Start a session for atomic operations
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the user in the database
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the restaurant exists
    const restaurantExists = await RestaurantModel.findById(restaurant).session(session);
    if (!restaurantExists) {
      throw new Error("Restaurant not found");
    }
  
    // Check if the user has already booked at the same restaurant for the same date and time
    const existingBooking = await RestaurantBooking.findOne({
      user: userId,
      restaurant: restaurant,
      dateTime
    }).session(session);

    if (existingBooking) {
      throw new Error("You already have a booking at this restaurant for this date and time.");
    }

    let totalPrice: number = 0;

    // Ensure that all menu items belong to the specified restaurant and calculate the total bill
    const userMenuItemsExist = await Promise.all(
      menuItems.map(async (menuItemId: string) => {
        const menuItem = await Menu.findById(menuItemId).session(session);
        if (!menuItem) {
          throw new Error(`Menu item with ID ${menuItemId} not found`);
        }

        // Verify the restaurant ID matches
        if (menuItem.restaurant.toString() !== restaurant.toString()) {
          throw new Error(`Menu item with ID ${menuItemId} does not belong to restaurant ${restaurant}`);
        }

        // Add the price of the menu item to the total bill
        totalPrice += menuItem.price;

        return menuItem._id;
      })
    );

    // Create the booking object
    const booking = {
      user: userId,
      restaurant,
      menuItems: userMenuItemsExist,
      dateTime,  // Store UTC time for consistency
      totalPrice,
    };

    // Save the booking into the database
    const newBooking = new RestaurantBooking(booking);
    await newBooking.save({ session });

    // Commit the transaction if all steps are successful
    await session.commitTransaction();
    session.endSession();

    // Return the booking data
    return {
      message: "Booking successfully created",
      bookingData: newBooking,
    };

  } catch (error: any) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Transaction failed: ${error.message}`);
  }
};
