import { formatTime } from "../Invite/invite.utils";
import { Menu } from "../Menu/menu.model";
import { RestaurantModel, UserModel } from "../user/user.model";
import { UserOfferProcessModel } from "../UserOfferProcess/userOfferProcess.model";
import Wallet from "../Wallet/wallet.model";
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
    minParticipants?: number;
    orderLimitPerParticipant?: number;
    age?: number; // sometimes may come on root, better ignore or unify
}

export const createOfferIntoDB = async (
    userId: string,
    offerData: OfferData,
    mediaUrl: string,
    fileCategory: string
) => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
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
            minParticipants,
            orderLimitPerParticipant,
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

        // const now = new Date();
        const overlappingOffer = await Offer.findOne({
            appointmentDate: { $lte: appointmentDate },
            expirationDate: { $gte: expirationDate }
        }).session(session);

        if (overlappingOffer) {
            throw new Error('There is already an offer overlapping this time period.');
        }

        const activeOfferForRestaurant = await Offer.findOne({
            restaurant,
            expirationDate: { $gte: new Date() },
        }).session(session);

        if (activeOfferForRestaurant) {
            throw new Error('You have already created an active offer for this restaurant.');
        }

        // // Validate duration
        // if (!(duration > 0 && duration <= 1440)) {
        //     throw new Error('Duration must be between 1 and 1440 minutes (24 hours)');
        // }

        // Validate time difference
        // const diffMinutes =
        //     Math.abs(new Date(expirationTime).getTime() - new Date(appointmentTime).getTime()) /
        //     (1000 * 60);
        // if (duration > diffMinutes) {
        //     throw new Error(
        //         'Duration cannot be greater than the difference between appointment time and expiration time'
        //     );
        // }

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

        let orgamizerWallet = await Wallet.findOne({ user: user._id }).session(session);
        if (!orgamizerWallet) {

            throw new Error('Organizer wallet not found');
        }

        if (orgamizerWallet.totalBalance < organizerTotalAmount) {
            throw new Error('Insufficient Balance');
        }
        const restaurantWallet = await Wallet.findOne({ user: restaurant }).session(session);
        if (!restaurantWallet) {
            throw new Error('Restaurant wallet not found');
        }
        const participantData = [{ user: user._id, selectedMenuItems: organizerMenuItemsExist }];


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
                    media: { url: mediaUrl, type: fileCategory },
                    appointmentDate,
                    agenda,
                    description,
                    appointmentTime: formattedTime,
                    expirationDate,
                    expirationTime: formattedExpirationTime,
                    contribution,
                    extraChargeType,
                    extraChargeAmount,
                    status: 'Pending',
                    minParticipants,
                    orderLimitPerParticipant,
                    audienceDetails: audienceDetailsData,
                    participants: participantData,
                    restaurant,
                },
            ],
            { session }
        );
        let participantsToInclude = [];

        if (contribution === "Each pay their own" || contribution === "Organizer pay for all") {
            await Wallet.findByIdAndUpdate(
                orgamizerWallet._id,
                { $inc: { totalBalance: -organizerTotalAmount } },
                { new: true, session }
            );
            await Wallet.findByIdAndUpdate(
                restaurantWallet._id,
                { $inc: { totalBalance: organizerTotalAmount } },
                { new: true, session }
            );
            if (extraChargeType === "Participants pay organizer") {
                participantsToInclude.push({
                    user: user._id,
                    amountToPay: 0,
                    organizerMenuItemsToPay: 0,
                    participantMenutItemsToPay: 0,
                    extraChargeAmountToGet: extraChargeAmount,
                    extraChargeAmountToPay: 0,
                    status: "Accepted"
                });
                await UserOfferProcessModel.create([{ offer: offer[0]._id, participantsInProcess: participantsToInclude }], {});
            } else if (extraChargeType === "Organizer pays participants") {
                participantsToInclude.push({
                    user: user._id,
                    amountToPay: 0,
                    organizerMenuItemsToPay: 0,
                    participantMenutItemsToPay: 0,
                    extraChargeAmountToGet: 0,
                    extraChargeAmountToPay: extraChargeAmount,
                    status: "Accepted"
                });
                await UserOfferProcessModel.create([{ offer: offer[0]._id, participantsInProcess: participantsToInclude }], {});
            }
        }

        // if (contribution === "Participants pay organizer") {
        //     if (extraChargeType === "Participants pay organizer") {
        //         participantsToInclude.push({
        //             user: user._id,
        //             amountToPay: 0,
        //             organizerMenuItemsToPay: organizerTotalAmount,
        //             participantMenutItemsToPay: 0,
        //             extraChargeAmountToGet: extraChargeAmount,
        //             extraChargeAmountToPay: 0,
        //             status: "Accepted"
        //         });
        //         await UserOfferProcessModel.create([{ offer: offer[0]._id, participantsInProcess: participantsToInclude }], {});
        //     } else if (extraChargeType === "Organizer pays participants") {
        //         participantsToInclude.push({
        //             user: user._id,
        //             amountToPay: 0,
        //             organizerMenuItemsToPay: organizerTotalAmount,
        //             participantMenutItemsToPay: 0,
        //             extraChargeAmountToGet: 0,
        //             extraChargeAmountToPay: extraChargeAmount,
        //             status: "Accepted"
        //         });
        //         await UserOfferProcessModel.create([{ offer: offer[0]._id, participantsInProcess: participantsToInclude }], {});
        //     }
        // }

        await session.commitTransaction();
        session.endSession();

        return offer;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const acceptOfferIntoDB = async (userId: string, offerData: any) => {
    const { offerId, userMenuItems } = offerData;
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = (await UserModel.findById(userId).session(session)) as mongoose.Document & {
            _id: mongoose.Types.ObjectId;
        }; if (!user) {
            throw new Error('User not found');
        }
        const offer = await Offer.findById(offerId).session(session);
        if (!offer) {
            throw new Error('Offer not found');
        }

        // Check if the user is already a participant
        const isParticipant = offer.participants.some((participant) => participant.user.toString() === userId);
        if (isParticipant) {
            throw new Error('Your is already a participant in this offer');
        }
        if (offer.organizer.toString() === user._id.toString()) {
            throw new Error("Organizer cannot accept own offer");
        }
        if (offer.expirationDate && new Date(offer.expirationDate) < new Date()) {
            throw new Error("Offer has expired");
        }
        const restaurantIdToVerify = offer.restaurant;
        let userTotalAmount: number = 0;

        const userMenuItemsExist = await Promise.all(
            userMenuItems.map(async (menuItemId: string) => {
                const menuItem = await Menu.findById(menuItemId).session(session);
                if (!menuItem) {
                    throw new Error(`Menu item with ID ${menuItemId} not found`);
                }
                // Verify the restaurant ID matches
                if (menuItem.restaurant.toString() !== restaurantIdToVerify.toString()) {
                    throw new Error(`Menu item with ID ${menuItemId} does not belong to restaurant ${restaurantIdToVerify}`);
                }
                const price = menuItem.price;
                userTotalAmount += price;
                return menuItem._id;
            })
        );

        if (userMenuItemsExist) {
            offer.participants.push({ user: userId, selectedMenuItems: userMenuItemsExist });
            // await invite.save({ session });
        }

        const userOfferProcess = await UserOfferProcessModel.findOne({
            offer: offer._id,

        }).session(session);
        if (!userOfferProcess) {
            throw new Error("User invitation process not found");
        }

        const alreadyaccepted = userOfferProcess.participantsInProcess.find(
            (p: any) => p.user.toString() === user._id.toString() && p.status === "Accepted"
        );
        if (alreadyaccepted) {
            throw new Error("You have already accepted this offer");
        }

        if (offer.contribution === "Each pay their own") {
            const userWallet = await Wallet.findOne({ user: user._id }).session(session);
            if (!userWallet) {
                throw new Error("User wallet not found");
            }
            if (userWallet.totalBalance < userTotalAmount) {
                throw new Error("Insufficient balance");
            }
            const cutMenuPrice = await Wallet.findByIdAndUpdate(
                userWallet._id,
                { $inc: { totalBalance: -userTotalAmount } },
                { new: true, session }
            );
            if (!cutMenuPrice) {
                throw new Error("Failed to deduct menu price from user wallet");
            }
            const addToRestaurantWallet = await Wallet.findByIdAndUpdate(
                restaurantIdToVerify,
                { $inc: { totalBalance: userTotalAmount } },
                { new: true, session }
            );
            if (!addToRestaurantWallet) {
                throw new Error("Failed to add menu price to restaurant wallet");
            }
            if (offer.extraChargeType === "Participants pay organizer") {
                userOfferProcess.participantsInProcess.push({
                    user: user._id,
                    amountToPay: 0,
                    organizerMenuItemsToPay: 0,
                    participantMenutItemsToPay: 0,
                    extraChargeAmountToGet: 0,
                    extraChargeAmountToPay: offer.extraChargeAmount,
                    status: "Processing"
                });
                await userOfferProcess.save({ session });
            } else if (offer.extraChargeType === "Organizer pays participants") {
                userOfferProcess.participantsInProcess.push({
                    user: user._id,
                    amountToPay: 0,
                    organizerMenuItemsToPay: 0,
                    participantMenutItemsToPay: 0,
                    extraChargeAmountToGet: offer.extraChargeAmount,
                    extraChargeAmountToPay: 0,
                    status: "Processing"
                });
                await userOfferProcess.save({ session });
            }
        } else if (offer.contribution === "Organizer pay for all") {
            await UserOfferProcessModel.findOneAndUpdate(
                {
                    "participantsInProcess.user": offer.organizer,
                },
                {
                    $inc: { "participantsInProcess.$.participantMenutItemsToPay": userTotalAmount },
                },
                { new: true, session }
            );
            if (offer.extraChargeType === "Participants pay organizer") {
                userOfferProcess.participantsInProcess.push({
                    user: user._id,
                    amountToPay: 0,
                    organizerMenuItemsToPay: 0,
                    participantMenutItemsToPay: 0,
                    extraChargeAmountToGet: 0,
                    extraChargeAmountToPay: offer.extraChargeAmount,
                    status: "Processing"
                });
                await userOfferProcess.save({ session });
            } else if (offer.extraChargeType === "Organizer pays participants") {
                userOfferProcess.participantsInProcess.push({
                    user: user._id,
                    amountToPay: 0,
                    organizerMenuItemsToPay: 0,
                    participantMenutItemsToPay: 0,
                    extraChargeAmountToGet: offer.extraChargeAmount,
                    extraChargeAmountToPay: 0,
                    status: "Processing"
                });
                await userOfferProcess.save({ session });
            }
        }
        // else if (offer.contribution === "Participants pay organizer") {
        //     if (offer.extraChargeType === "Participants pay organizer") {
        //         userOfferProcess.participantsInProcess.push({
        //             user: user._id,
        //             amountToPay: 0,
        //             organizerMenuItemsToPay: 0,
        //             participantMenutItemsToPay: 0,
        //             extraChargeAmountToGet: 0,
        //             extraChargeAmountToPay: offer.extraChargeAmount,
        //             status: "Processing"
        //         });
        //         await userOfferProcess.save({ session });
        //     } else if (offer.extraChargeType === "Organizer pays participants") {
        //         userOfferProcess.participantsInProcess.push({
        //             user: user._id,
        //             amountToPay: 0,
        //             organizerMenuItemsToPay: 0,
        //             participantMenutItemsToPay: 0,
        //             extraChargeAmountToGet: offer.extraChargeAmount,
        //             extraChargeAmountToPay: 0,
        //             status: "Processing"
        //         });
        //         await userOfferProcess.save({ session });
        //     }
        // }

        // Add the user to the participants list
        await offer.save({ session });

        await session.commitTransaction();
        session.endSession();

        return offer;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}

export const getOffersFromDB = async (userId: string) => {
    // 1. Fetch the user
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // 2. Build partial match conditions using $or
    const orConditions: any[] = [
        { 'audienceDetails.age': user.age },
        { 'audienceDetails.education': user.educationalQualification },
        { 'audienceDetails.profession': user.profession },
        { 'audienceDetails.gender': user.gender },
        { 'audienceDetails.religion': user.religion },
        { 'audienceDetails.weight': user.weight },
        { 'audienceDetails.height': user.height },
        { 'audienceDetails.race': user.race },
    ];

    // Handle language(s)
    if (Array.isArray(user.languages)) {
        orConditions.push({ 'audienceDetails.language': { $in: user.languages } });
    } else {
        orConditions.push({ 'audienceDetails.language': user.languages });
    }

    // Handle interest(s)
    if (Array.isArray(user.interests)) {
        orConditions.push({ 'audienceDetails.interests': { $in: user.interests } });
    } else {
        orConditions.push({ 'audienceDetails.interests': user.interests });
    }

    // 3. Query offers matching any of the above fields (partial match)
    const offers = await Offer.find({ $or: orConditions });

    // 4. Format and return offers
    return offers.map((offer) => {
        const obj = offer.toObject();
        return {
            ...obj,
            appointmentDate: obj.appointmentDate?.toISOString(),
            expirationDate: obj.expirationDate?.toISOString(),
            appointmentTime: formatTime(obj.appointmentTime),
            expirationTime: formatTime(obj.expirationTime),
        };
    });
};

/* 
abc def ijk lmn opq rst uvw xyz
offer id 
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