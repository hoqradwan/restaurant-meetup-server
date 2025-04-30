import { Menu } from "../Menu/menu.model";
import { RestaurantModel, UserModel } from "../user/user.model";
import Invite from "./invite.model";
import { formatTime } from "./invite.utils";

export const createInviteIntoDB = async (inviteData: any, userId: string, image: string) => {
    const {  appointmentDate, time, duration, restaurant, expirationDate, expirationTime, agenda, participants, menuItems, contribution, amount } = inviteData;
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const isDurationValid = duration > 0 && duration <= 1440;
    if (!isDurationValid) {
        throw new Error("Duration must be between 1 and 1440 minutes (24 hours)");
    }
    const differencebetweenTimeAndExpirationTIme = Math.abs(new Date(expirationTime).getTime() - new Date(time).getTime()) / (1000 * 60); // Difference in minutes
    if (duration > differencebetweenTimeAndExpirationTIme) {
        throw new Error("Duration cannot be greater than the difference between time and expiration time");
    }
    const isRestaurantExists = await RestaurantModel.findById(restaurant);
    if (!isRestaurantExists) {
        throw new Error("Restaurant not found");
    }
    const participantIds = await Promise.all(
        participants.map(async (participantId: string) => {
            const participant = await UserModel.findById(participantId);
            if (!participant) {
                throw new Error(`Participant not found`);
            }
            return participant._id;
        })
    );
    if (appointmentDate < new Date()) {
        throw new Error("Appointment date cannot be in the past");
    }
    if (expirationDate < new Date() && expirationDate < appointmentDate) {
        throw new Error("Expiration date cannot be in the past or before appointment date");
    }
    const formattedTime = formatTime(time);
    const formattedExpirationTime = formatTime(expirationTime);
    const menuItemsIds = await Promise.all(
        menuItems.map(async (menuItemId: string) => {
            const menuItem = await Menu.findById(menuItemId);
            if (!menuItem) {
                throw new Error(`Menu item not found`);
            }
            return menuItem._id;
        })
    )


    const invite = await Invite.create({ ...inviteData, image, user: user._id, fbUrl: user.facebookUrl, menuItems: menuItemsIds, instaUrl: user.instagramUrl, linkedinUrl: user.linkedinUrl, time: formattedTime, expirationTime: formattedExpirationTime, participants: participantIds, restaurant });
    return invite;
}