import mongoose from 'mongoose';
import { RestaurantModel, UserModel } from '../user/user.model';
import { Menu } from '../Menu/menu.model';

export const bookRestaurantIntoDB = async (userId: string, bookingData: any) => {
  const { restaurant, menuItems, date, time } = bookingData;

  // Start a session
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

    let totalBill: number = 0;

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
        const price = menuItem.price;
        totalBill += price;

        return menuItem._id;
      })
    );

    // Assuming you would store the booking information here
    const booking = {
      user: userId,
      restaurant,
      menuItems: userMenuItemsExist,
      date,
      time,
      totalBill,
    };

    // Store the booking data (create booking document)
    // Example: Create a new booking model (you should have a Booking model in your application)
    // const bookingCreated = await BookingModel.create([booking]);

    // Commit the transaction if all steps are successful
    await session.commitTransaction();
    session.endSession();

    // Return the booking data (or return something else if needed)
    return {
      message: "Booking successfully created",
      totalBill,
      bookingData: booking,
    };

  } catch (error : any) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Transaction failed: ${error.message}`);
  }
};