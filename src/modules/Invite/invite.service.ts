import { CommonDetailsOfferOrInvite } from "../CommonDetailsOfferOrInvite/CommonDetailsOfferOrInvite.model";
import { Menu } from "../Menu/menu.model";
import { RestaurantModel, UserModel } from "../user/user.model";
import { UserInvitationProcessModel } from "../UserInvitaionProcess/userInvitaionProcess.model";
import Invite from "./invite.model";
import { formatTime, generateTicketNumber } from "./invite.utils";
import mongoose from 'mongoose';


export const createInviteIntoDB = async (inviteData: any, userId: string, image: string) => {
    const session = await mongoose.startSession(); // Start a session for the transaction
    session.startTransaction(); // Begin the transaction

    try {
        const { appointmentDate, appointmentTime, duration, description, restaurant, organizerMenuItems, expirationDate, expirationTime, agenda, participants, contribution, extraChargeType, extraChargeAmount } = inviteData;

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

        // if (expirationTime > appointmentTime) {
        //     throw new Error("Expiration time cannot be less than appointment time");
        // }
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

        // Get participant data and validate selected menu items
        const participantData = await Promise.all(
            participants.map(async (p: { user: string }) => {
                const participant = await UserModel.findById(p.user).session(session);
                if (!participant) {
                    throw new Error(`Participant user with ID ${p.user} not found`);
                }
                return {
                    user: participant._id,
                    selectedMenuItems: []
                };
            })
        );
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
        participantData.push({ user: user._id, selectedMenuItems: organizerMenuItemsExist });
        // Generate a ticket number
        const ticketNumber = generateTicketNumber();


        // Create common details for the invite
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
            ticketNumber,
            status: "Pending",
            type: "Invite",
        };

        // Create common details document within the transaction
        const commonDetailsOfferOrInvite = await CommonDetailsOfferOrInvite.create([commonDetails], { session });
        if (!commonDetailsOfferOrInvite) {
            throw new Error("Failed to create common details for invite");
        }
        let participantsInPrecessTmp: { user: any; amountToPay: number ; status: string;}[] = [];
        let UserInvitationProcess;
        if (contribution === "Each pay their own") {
         
            participantsInPrecessTmp.push({ user: user._id, amountToPay: organizerTotalAmount, status: "Accepted" });   
            UserInvitationProcess = await UserInvitationProcessModel.create([{ commonDetailsOfferOrInvite: commonDetailsOfferOrInvite[0]._id, participantsInProcess: participantsInPrecessTmp }], { session });

        } else if (contribution === "Organizer pay for all") {
            participantsInPrecessTmp.push({ user: user._id, amountToPay: organizerTotalAmount, status: "Accepted" });   
            UserInvitationProcess = await UserInvitationProcessModel.create([{ commonDetailsOfferOrInvite: commonDetailsOfferOrInvite[0]._id, participantsInProcess: participantsInPrecessTmp }], { session });
         
        } else if (contribution === "Participants pay organizer") {
            participantsInPrecessTmp.push({ user: user._id, amountToPay: 0, status: "Accepted" });   
            UserInvitationProcess = await UserInvitationProcessModel.create([{ commonDetailsOfferOrInvite: commonDetailsOfferOrInvite[0]._id, participantsInProcess: participantsInPrecessTmp }], { session });
        }
        // Add common details to invite data
        const inviteDataWithCommonDetails = { participants: participantData, restaurant, commonDetailsOfferOrInvite: commonDetailsOfferOrInvite[0]._id };

        // Create the invite document within the transaction
        const invite = await Invite.create([inviteDataWithCommonDetails], { session });

        // Commit the transaction if everything goes well
        await session.commitTransaction();
        session.endSession();

        return { UserInvitationProcess, commonDetailsOfferOrInvite, invite };
    } catch (error) {
        // Rollback the transaction if an error occurs
        await session.abortTransaction();
        session.endSession();

        throw error;  // Re-throw the error to be handled by the caller
    }
};


