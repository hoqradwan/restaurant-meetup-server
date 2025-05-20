import { CommonDetailsOfferOrInvite } from "../CommonDetailsOfferOrInvite/CommonDetailsOfferOrInvite.model";
import { formatTime } from "../Invite/invite.utils";
import { Menu } from "../Menu/menu.model";
import { RestaurantModel, UserModel } from "../user/user.model";
import { Offer } from "./offer.model";

import mongoose, { ClientSession, Types } from 'mongoose';

interface AudienceDetails {
    age?: number;
    education?: string;
    race?: string;
    profession?: string;
    language?: string;
    height?: number;
    gender?: string;
    weight?: number;
    religion?: string;
    interest?: string;
}

interface OfferData {
    appointmentDate: Date | string;
    appointmentTime: string;
    duration: number;
    description: string;
    restaurant: Types.ObjectId | string;
    organizerMenuItems: (Types.ObjectId | string)[];
    expirationDate: Date | string;
    expirationTime: string;
    agenda: string;
    participants?: any[];
    contribution: string;
    extraChargeType: string;
    extraChargeAmount: number;
    audienceDetails?: AudienceDetails;
    age?: number; // sometimes may come on root, better ignore or unify
}

export const createOfferIntoDB = async (
    userId: string,
    offerData: OfferData,
    image: string
) => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    // console.log("Creating offer with data: ", offerData);
    console.log("User ID: ", userId);
    try {
        const {
            appointmentDate,
            appointmentTime,
            duration,
            description,
            restaurant,
            organizerMenuItems,
            expirationDate,
            expirationTime,
            agenda,
            contribution,
            extraChargeType,
            extraChargeAmount,
        } = offerData;

        // Safely destructure audienceDetails or default to empty object
        const {
            age,
            education,
            race,
            profession,
            language,
            height,
            gender,
            weight,
            religion,
            interest,
        } = offerData.audienceDetails ?? {};

        // Find the user
        const user = await UserModel.findById(userId).session(session);
        if (!user) {
            throw new Error('User not found');
        }

        // Validate duration
        if (!(duration > 0 && duration <= 1440)) {
            throw new Error('Duration must be between 1 and 1440 minutes (24 hours)');
        }

        // Validate time difference
        const diffMinutes =
            Math.abs(new Date(expirationTime).getTime() - new Date(appointmentTime).getTime()) /
            (1000 * 60);
        if (duration > diffMinutes) {
            throw new Error(
                'Duration cannot be greater than the difference between appointment time and expiration time'
            );
        }

        // Check if restaurant exists
        const isRestaurantExists = await RestaurantModel.findById(restaurant).session(session);
        if (!isRestaurantExists) {
            throw new Error('Restaurant not found');
        }

        // Validate appointment and expiration dates
        if (new Date(appointmentDate) < new Date()) {
            throw new Error('Appointment date cannot be in the past');
        }
        if (new Date(expirationDate) < new Date() || new Date(expirationDate) < new Date(appointmentDate)) {
            throw new Error('Expiration date cannot be in the past or before appointment date');
        }

        // Format times (assuming formatTime returns string)
        const formattedTime = formatTime(appointmentTime);
        const formattedExpirationTime = formatTime(expirationTime);

        let organizerTotalAmount = 0;
        const organizerMenuItemsExist = await Promise.all(
            organizerMenuItems.map(async (menuItemId) => {
                const menuItem = await Menu.findById(menuItemId).session(session);
                if (!menuItem) {
                    throw new Error(`Menu item with ID ${menuItemId} not found`);
                }
                organizerTotalAmount += menuItem.price;
                return menuItem._id;
            })
        );

        const participantData = [{ user: user._id, selectedMenuItems: organizerMenuItemsExist }];

        const commonDetails = {
            image,
            appointmentDate,
            agenda,
            description,
            appointmentTime: formattedTime,
            duration,
            expirationDate,
            expirationTime: formattedExpirationTime,
            fbUrl: user.facebookUrl || "abc",
            instaUrl: user.instagramUrl || "abc",
            linkedinUrl: user.linkedinUrl || "abc",
            contribution,
            extraChargeType,
            extraChargeAmount,
            status: 'Pending',
            type: 'Offer',
        };

        // Create common details document
        const commonDetailsOfferOrInvite = await CommonDetailsOfferOrInvite.create([commonDetails], { session });
        if (!commonDetailsOfferOrInvite.length) {
            throw new Error('Failed to create common details for invite');
        }

        const audienceDetailsData: AudienceDetails = {
            age,
            education,
            race,
            profession,
            language,
            height,
            gender,
            weight,
            religion,
            interest,
        };

        const offer = await Offer.create(
            [
                {
                    organizer: user._id,
                    CommonDetailsOfferOrInvite: commonDetailsOfferOrInvite[0]._id,
                    audienceDetails: audienceDetailsData,
                    participants: participantData,
                    restaurant,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return offer;
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
  "appointmentTime": "10:00",
  "duration": 120,
  "expirationDate": "2025-06-10T23:59:59.000Z",
  "expirationTime": "23:59",
  "agenda": "Keynote speeches, networking, workshops",
  "fbUrl": "https://facebook.com/tech.event",
  "instaUrl": "https://instagram.com/tech.event",
  "linkedinUrl": "https://linkedin.com/company/tech-event",
  "contribution": "Each pay their own",
  "extraChargeType": "Participants pay organizer",
  "extraChargeAmount": 200,
  "organizerMenuItems": [
    "6818914f9cbd2e29d86903b3",
    "681891579cbd2e29d86903b7"
  ],
  "audienceDetails": {
    "age": 30,
    "education": "Bachelor's Degree",
    "race": "Asian",
    "profession": "Software Engineer",
    "language": "English",
    "height": 175,
    "gender": "Male",
    "weight": 70,
    "religion": "None",
    "interest": "Technology"
  },
  "restaurant": "682bfb83d8ddcf1f65816262"
}

*/