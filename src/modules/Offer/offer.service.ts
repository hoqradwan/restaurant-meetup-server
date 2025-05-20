import { CommonDetailsOfferOrInvite } from "../CommonDetailsOfferOrInvite/CommonDetailsOfferOrInvite.model";
import { formatTime } from "../Invite/invite.utils";
import { Menu } from "../Menu/menu.model";
import { RestaurantModel, UserModel } from "../user/user.model";
import mongoose from "mongoose";

export const createOfferIntoDB = async (offerData: any, userId: string, image: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { appointmentDate, appointmentTime, duration, description, restaurant, organizerMenuItems, expirationDate, expirationTime, agenda, participants, contribution, extraChargeType, extraChargeAmount } = offerData;

        // Find the user
        const user = await UserModel.findById(userId).session(session);
        if (!user) {
            throw new Error("User not found");
        }

        // Validate duration
        const isDurationValid = duration > 0 && duration <= 1440;
        if (!isDurationValid) {
            throw new Error("Duration must be between 1 and 1440 minutes (24 hours)");
        }

        // Check if the duration is valid based on the difference between appointment time and expiration time
        const differencebetweenTimeAndExpirationTIme = Math.abs(new Date(expirationTime).getTime() - new Date(appointmentTime).getTime()) / (1000 * 60); // Difference in minutes
        if (duration > differencebetweenTimeAndExpirationTIme) {
            throw new Error("Duration cannot be greater than the difference between appointment time and expiration time");
        }

        // Check if the restaurant exists
        const isRestaurantExists = await RestaurantModel.findById(restaurant).session(session);
        if (!isRestaurantExists) {
            throw new Error("Restaurant not found");
        }

        // Validate appointment and expiration dates
        if (appointmentDate < new Date()) {
            throw new Error("Appointment date cannot be in the past");
        }
        if (expirationDate < new Date() && expirationDate > appointmentDate) {
            throw new Error("Expiration date cannot be in the past or after appointment date");
        }

        // Format the time values
        const formattedTime = formatTime(appointmentTime);
        const formattedExpirationTime = formatTime(expirationTime);

        let organizerTotalAmount = 0;
        const organizerMenuItemsExist = await Promise.all(
            organizerMenuItems.map(async (menuItemId: string) => {
                const menuItem = await Menu.findById(menuItemId).session(session);
                if (!menuItem) {
                    throw new Error(`Menu item with ID ${menuItemId} not found`);
                }
                const price = menuItem.price;
                organizerTotalAmount += price;
                return menuItem._id;
            })
        );

        const participantData = [];
        participantData.push({ user: user._id, selectedMenuItems: organizerMenuItemsExist });
        const commonDetails = {
            image,
            appointmentDate,
            agenda,
            description,
            appointmentTime: formattedTime,
            duration,
            expirationDate,
            expirationTime: formattedExpirationTime,
            fbUrl: user.facebookUrl,
            instaUrl: user.instagramUrl,
            linkedinUrl: user.linkedinUrl,
            contribution,
            extraChargeType,
            extraChargeAmount,
            status: "Pending",
            type: "Offer",
        };

        // Create common details document within the transaction
        const commonDetailsOfferOrInvite = await CommonDetailsOfferOrInvite.create([commonDetails], { session });
        if (!commonDetailsOfferOrInvite) {
            throw new Error("Failed to create common details for invite");
        }
        // TODO: Create and save the offer here using session

        await session.commitTransaction();
        session.endSession();
        // return the created offer or any result as needed
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};