import { CommonDetailsOfferOrInvite } from "../CommonDetailsOfferOrInvite/CommonDetailsOfferOrInvite.model";
import { formatTime } from "../Invite/invite.utils";
import { Menu } from "../Menu/menu.model";
import { RestaurantModel, UserModel } from "../user/user.model";
import mongoose from "mongoose";
import { Offer } from "./offer.model";

export const createOfferIntoDB = async (offerData: any, userId: string, image: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { appointmentDate, appointmentTime, duration, description, restaurant, organizerMenuItems, expirationDate, expirationTime, agenda, participants, contribution, extraChargeType, extraChargeAmount, age,
          } = offerData;
          const {  education,
            race,
            profession,
            language,
            height,
            gender,
            weight,
            religion,
            interest } = offerData.audienceDetails;

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
        const audienceDetailsData = {
            age,
            education,
            race,
            profession,
            language,
            height,
            gender,
            weight,
            religion,
            interest
        }
        // TODO: Create and save the offer here using session
        const offer = await Offer.create([{
            organizer: user._id,
            CommonDetailsOfferOrInvite: commonDetailsOfferOrInvite[0]._id,
            audienceDetails: audienceDetailsData,
            participants: participantData,
            restaurant: restaurant,
        }], { session });

        await session.commitTransaction();
        session.endSession();
        return offer; // return the created offer or any result as needed


        // return the created offer or any result as needed
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};


/* 

{
  "appointmentDate": "2025-06-01T10:00:00.000Z",
  "description": "Exclusive networking event for tech professionals.",
  "appointmentTime": "10:00 AM",
  "duration": 120,
  "expirationDate": "2025-06-10T23:59:59.000Z",
  "expirationTime": "11:59 PM",
  "agenda": "Keynote speeches, networking, workshops",
  "fbUrl": "https://facebook.com/tech.event",
  "instaUrl": "https://instagram.com/tech.event",
  "linkedinUrl": "https://linkedin.com/company/tech-event",
  "contribution": "Each pay their own",
  "extraChargeType": "Participants pay organizer",
  "extraChargeAmount": 20,
  "status": "Pending",
  "type": "Offer",
    "age": 30,
    "education": "Bachelor's Degree",
    "race": "Asian",
    "profession": "Software Engineer",
    "language": "English",
    "height": 175,
    "gender": "Male",
    "weight": 70,
    "religion": "None",
    "interest": "Technology",
  "restaurant": "64b3e2f1f1d23b00123a4568",
  "participants": [
    {
      "user": "64b3e2f1f1d23b00123a4567",
      "selectedMenuItems": ["64b3e2f1f1d23b00123a4569"]
    },
    {
      "user": "64b3e2f1f1d23b00123a456a",
      "selectedMenuItems": ["64b3e2f1f1d23b00123a4569"]
    }
  ]
}


*/