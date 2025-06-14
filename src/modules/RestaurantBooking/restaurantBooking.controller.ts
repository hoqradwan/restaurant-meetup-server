import { Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest } from "../../utils/customRequest";
import sendResponse from "../../utils/sendResponse";
import { bookRestaurantIntoDB, getAllRestaurantBookingsByUserFromDB, getAllRestaurantBookingsFromDB } from "./restaurantBooking.service";

export const bookRestaurant = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const bookingData = req.body;
    const result = await bookRestaurantIntoDB(userId, bookingData);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Restaurant booked successfully",
        data: result
    });
});
export const getAllRestaurantBookings = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const result = await getAllRestaurantBookingsFromDB(userId);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Restaurant bookings retrieved successfully",
        data: result
    });
});
export const getAllRestaurantBookingsByUser = catchAsync(async (req: CustomRequest, res: Response) => {
    const { id: userId } = req.user;
    const result = await getAllRestaurantBookingsByUserFromDB(userId);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Restaurant bookings by user retrieved successfully",
        data: result
    });
});