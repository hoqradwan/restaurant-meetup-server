import { extra } from "http-status";
import { Menu } from "../Menu/menu.model";
import { RestaurantModel, UserModel } from "../user/user.model";
import { UserInvitationProcessModel } from "../UserInvitaionProcess/userInvitaionProcess.model";
import Wallet from "../Wallet/wallet.model";
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
        // const now = new Date();
        const overlappingOffer = await Invite.findOne({
            appointmentDate: { $lte: appointmentDate },
            expirationDate: { $gte: expirationDate }
        }).session(session);

        if (overlappingOffer) {
            throw new Error('There is already an invitation overlapping this time period.');
        }

        const activeOfferForRestaurant = await Invite.findOne({
            restaurant,
            expirationDate: { $gte: new Date() },
        }).session(session);

        if (activeOfferForRestaurant) {
            throw new Error('You have already created an active invitation for this restaurant.');
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
                const hasSendInviteAlready = await Invite.findOne({ user: user._id, participants: { $elemMatch: { user: participant._id } }, restaurant }).session(session);
                if (hasSendInviteAlready) {
                    throw new Error(`This participant has already been invited by you to this restaurant`);
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
        if (contribution === "Each pay their own" || contribution === "Organizer pay for all") {
            const orgamizerWallet = await Wallet.findOne({ user: user._id }).session(session);
            if (!orgamizerWallet) {
                throw new Error("Organizer wallet not found");
            }
            if (orgamizerWallet.totalBalance < organizerTotalAmount) {
                throw new Error("Insufficient Balance");
            }
        }
        if (extraChargeType === "Organizer pays participants") {
            const orgamizerWallet = await Wallet.findOne({ user: user._id }).session(session);
            if (!orgamizerWallet) {
                throw new Error("Organizer wallet not found");
            }
            if (orgamizerWallet.totalBalance < extraChargeAmount) {
                throw new Error("Insufficient Balance");
            }
        }
        // Add common details to invite data
        const inviteDataWithDetails = {
            organizer: user._id, participants: participantData, restaurant, image,
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
        };

        // Create the invite document within the transaction
        const invite = await Invite.create([inviteDataWithDetails], { session });

        let participantsInPrecessTmp: { user: any; amountToPay: number; extraChargeAmountToGet: number; extraChargeAmountToPay: number; status: string; }[] = [];
        let UserInvitationProcess;
        if (contribution === "Each pay their own") {
            if (extraChargeType === "Organizer pays participants") {
                let eachParticipantAmount = extraChargeAmount / participants.length;
                participantsInPrecessTmp.push({ user: user._id, amountToPay: organizerTotalAmount, extraChargeAmountToGet: 0, extraChargeAmountToPay: extraChargeAmount, status: "Accepted" });
                await Wallet.findOneAndUpdate(
                    { user: user._id },
                    { $inc: { totalBalance: -(organizerTotalAmount + extraChargeAmount) } },
                    { new: true, session }
                );
                await Wallet.findOneAndUpdate(
                    { user: restaurant },
                    { $inc: { totalBalance: organizerTotalAmount } },
                    { new: true, session }
                );
                const processingParticipantData = await Promise.all(
                    participants.map(async (p: { user: string }) => {
                        const participant = await UserModel.findById(p.user).session(session);
                        if (!participant) {
                            throw new Error(`Participant user with ID ${p.user} not found`);
                        }
                        // participantsInPrecessTmp.push({ user: participant._id, amountToPay: 0, extraChargeAmountToGet: eachParticipantAmount, extraChargeAmountToPay: 0, status: "pending" });
                        return {
                            user: participant._id,
                            amountToPay: 0,
                            extraChargeAmountToGet: eachParticipantAmount,
                            extraChargeAmountToPay: 0,
                            status: "Pending"
                        };
                    })
                );
                UserInvitationProcess = await UserInvitationProcessModel.create([{ invite: invite[0]._id, participantsInProcess: [participantsInPrecessTmp, ...processingParticipantData] }], { session });
            } else if (extraChargeType === "Participants pay organizer") {
                let eachParticipantAmount = extraChargeAmount / participants.length;
                participantsInPrecessTmp.push({ user: user._id, amountToPay: organizerTotalAmount, extraChargeAmountToGet: extraChargeAmount, extraChargeAmountToPay: 0, status: "Accepted" });
                await Wallet.findOneAndUpdate(
                    { user: user._id },
                    { $inc: { totalBalance: -organizerTotalAmount } },
                    { new: true, session }
                );
                await Wallet.findOneAndUpdate(
                    { user: restaurant },
                    { $inc: { totalBalance: organizerTotalAmount } },
                    { new: true, session }
                );
                const processingParticipantData = await Promise.all(
                    participants.map(async (p: { user: string }) => {
                        const participant = await UserModel.findById(p.user).session(session);
                        if (!participant) {
                            throw new Error(`Participant user with ID ${p.user} not found`);
                        }
                        // participantsInPrecessTmp.push({ user: participant._id, amountToPay: 0, extraChargeAmountToGet: eachParticipantAmount, extraChargeAmountToPay: 0, status: "pending" });
                        return {
                            user: participant._id,
                            amountToPay: 0,
                            extraChargeAmountToGet: 0,
                            extraChargeAmountToPay: eachParticipantAmount,
                            status: "Pending"
                        };
                    })
                );
                UserInvitationProcess = await UserInvitationProcessModel.create([{ invite: invite[0]._id, participantsInProcess: [...participantsInPrecessTmp, ...processingParticipantData] }], { session });
            }


        } else if (contribution === "Organizer pay for all") {
            if (extraChargeType === "Organizer pays participants") {
                let eachParticipantAmount = extraChargeAmount / participants.length;
                participantsInPrecessTmp.push({ user: user._id, amountToPay: organizerTotalAmount, extraChargeAmountToGet: 0, extraChargeAmountToPay: extraChargeAmount, status: "Accepted" });

                await Wallet.findOneAndUpdate(
                    { user: user._id },
                    { $inc: { totalBalance: -(organizerTotalAmount + extraChargeAmount) } },
                    { new: true, session }
                );
                await Wallet.findOneAndUpdate(
                    { user: restaurant },
                    { $inc: { totalBalance: organizerTotalAmount } },
                    { new: true, session }
                );
                const processingParticipantData = await Promise.all(
                    participants.map(async (p: { user: string }) => {
                        const participant = await UserModel.findById(p.user).session(session);
                        if (!participant) {
                            throw new Error(`Participant user with ID ${p.user} not found`);
                        }
                        // participantsInPrecessTmp.push({ user: participant._id, amountToPay: 0, extraChargeAmountToGet: eachParticipantAmount, extraChargeAmountToPay: 0, status: "pending" });
                        return {
                            user: participant._id,
                            amountToPay: 0,
                            extraChargeAmountToGet: eachParticipantAmount,
                            extraChargeAmountToPay: 0,
                            status: "Pending"
                        };
                    })
                );

                UserInvitationProcess = await UserInvitationProcessModel.create([{ invite: invite[0]._id, participantsInProcess: [...participantsInPrecessTmp, ...processingParticipantData] }], { session });
            } else if (extraChargeType === "Participants pay organizer") {
                let eachParticipantAmount = extraChargeAmount / participants.length;
                participantsInPrecessTmp.push({ user: user._id, amountToPay: organizerTotalAmount, extraChargeAmountToGet: extraChargeAmount, extraChargeAmountToPay: 0, status: "Accepted" });
                await Wallet.findOneAndUpdate(
                    { user: user._id },
                    { $inc: { totalBalance: -organizerTotalAmount + extraChargeAmount } },
                    { new: true, session }
                );
                await Wallet.findOneAndUpdate(
                    { user: restaurant },
                    { $inc: { totalBalance: organizerTotalAmount } },
                    { new: true, session }
                );
                const processingParticipantData = await Promise.all(
                    participants.map(async (p: { user: string }) => {
                        const participant = await UserModel.findById(p.user).session(session);
                        if (!participant) {
                            throw new Error(`Participant user with ID ${p.user} not found`);
                        }
                        // participantsInPrecessTmp.push({ user: participant._id, amountToPay: 0, extraChargeAmountToGet: eachParticipantAmount, extraChargeAmountToPay: 0, status: "pending" });
                        return {
                            user: participant._id,
                            amountToPay: 0,
                            extraChargeAmountToGet: 0,
                            extraChargeAmountToPay: eachParticipantAmount,
                            status: "Pending"
                        };
                    })
                );
                UserInvitationProcess = await UserInvitationProcessModel.create([{ invite: invite[0]._id, participantsInProcess: [participantsInPrecessTmp, ...processingParticipantData] }], { session });
            }
            // const userWallet = await Wallet.findOne({ user: user._id }).session(session);
            // if (!userWallet || userWallet.totalBalance < organizerTotalAmount) {
            //     throw new Error("Insufficient wallet balance for the user");
            // }
            // const cutWalletBalance = await Wallet.findOneAndUpdate({ user: user._id }, { $inc: { balance: -organizerTotalAmount } }, { new: true, session });
            // if (!cutWalletBalance) {
            //     throw new Error("Failed to update wallet balance for the user");
            // }
        } else if (contribution === "Participants pay organizer") {
            if (extraChargeType === "Organizer pays participants") {
                let eachParticipantAmount = extraChargeAmount / participants.length;
                await Wallet.findOneAndUpdate(
                    { user: user._id },
                    { $inc: { totalBalance: -extraChargeAmount } },
                    { new: true, session }
                );
                participantsInPrecessTmp.push({ user: user._id, amountToPay: 0, extraChargeAmountToGet: 0, extraChargeAmountToPay: extraChargeAmount, status: "Accepted" });
                const processingParticipantData = await Promise.all(
                    participants.map(async (p: { user: string }) => {
                        const participant = await UserModel.findById(p.user).session(session);
                        if (!participant) {
                            throw new Error(`Participant user with ID ${p.user} not found`);
                        }
                        // participantsInPrecessTmp.push({ user: participant._id, amountToPay: 0, extraChargeAmountToGet: eachParticipantAmount, extraChargeAmountToPay: 0, status: "pending" });
                        return {
                            user: participant._id,
                            amountToPay: 0,
                            extraChargeAmountToGet: eachParticipantAmount,
                            extraChargeAmountToPay: 0,
                            status: "Pending"
                        };
                    })
                );
                UserInvitationProcess = await UserInvitationProcessModel.create([{ invite: invite[0]._id, participantsInProcess: [participantsInPrecessTmp, ...processingParticipantData] }], { session });
            } else if (extraChargeType === "Participants pay organizer") {
                let eachParticipantAmount = extraChargeAmount / participants.length;
                participantsInPrecessTmp.push({ user: user._id, amountToPay: organizerTotalAmount, extraChargeAmountToGet: extraChargeAmount, extraChargeAmountToPay: 0, status: "Accepted" });
                const processingParticipantData = await Promise.all(
                    participants.map(async (p: { user: string }) => {
                        const participant = await UserModel.findById(p.user).session(session);
                        if (!participant) {
                            throw new Error(`Participant user with ID ${p.user} not found`);
                        }
                        return {
                            user: participant._id,
                            amountToPay: 0,
                            extraChargeAmountToGet: 0,
                            extraChargeAmountToPay: eachParticipantAmount,
                            status: "Pending"
                        };
                    })
                );
                UserInvitationProcess = await UserInvitationProcessModel.create([{ invite: invite[0]._id, participantsInProcess: [participantsInPrecessTmp, ...processingParticipantData] }], { session });
            }

        }



        // Commit the transaction if everything goes well
        await session.commitTransaction();
        session.endSession();

        return { UserInvitationProcess, invite };
    } catch (error) {
        // Rollback the transaction if an error occurs
        await session.abortTransaction();
        session.endSession();

        throw error;  // Re-throw the error to be handled by the caller
    }
};

export const acceptInviteInDB = async (inviteData: any, userId: string) => {
    const { inviteId, userMenuItems } = inviteData;
    const session = await mongoose.startSession(); // Start a session for the transaction
    session.startTransaction(); // Begin the transaction
    try {
        // Find the user
        const user = (await UserModel.findById(userId).session(session)) as mongoose.Document & {
            _id: mongoose.Types.ObjectId;
        };
        if (!user) {
            throw new Error("User not found");
        }

        // Find the invite and populate commonDetailsOfferOrInvite
        const invite = await Invite.findById(inviteId).session(session).populate("commonDetailsOfferOrInvite");
        if (!invite) {
            throw new Error("Invite not found");
        }
        if (invite.organizer.toString() === user._id.toString()) {
            throw new Error("Organizer cannot accept own invite");
        }
        if (invite.expirationDate && new Date(invite.expirationDate) < new Date()) {
            throw new Error("Invitation has expired");
        }

        const participant = invite.participants.find((p: any) => p.user.toString() === user._id.toString());
        if (!participant) {
            throw new Error("User is not a participant in this invite");
        }
        const restaurantIdToVerify = invite.restaurant;
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
            participant.selectedMenuItems = userMenuItemsExist;
            await invite.save({ session });
        }

        const userInvitaionProcess = await UserInvitationProcessModel.findOne({
            invite: invite._id,

        }).session(session);
        if (!userInvitaionProcess) {
            throw new Error("User invitation process not found");
        }

        const alreadyaccepted = userInvitaionProcess.participantsInProcess.find(
            (p: any) => p.user.toString() === user._id.toString() && p.status === "Paid"
        );
        if (alreadyaccepted) {
            throw new Error("You have already accepted this invite");
        }

        for (const p of userInvitaionProcess.participantsInProcess) {
            if (p.user.toString() === user._id.toString()) {
                if (p.extraChargeAmountToGet > 0) {
                    const userWallet = await Wallet.findOne({ user: user._id }).session(session);
                    if (userWallet && userWallet.totalBalance < userTotalAmount) {
                        throw new Error("Insufficient balance");
                    }
                    if (invite.contribution === "Organizer pay for all") {
                        const organizerParticipant = invite.participants.find(
                            (p: any) => p.user.toString() === invite.organizer.toString()
                        );
                        if (!organizerParticipant) {
                            throw new Error("Organizer not found");
                        }
                        await UserInvitationProcessModel.findOneAndUpdate(
                            {
                                "participantsInProcess.user": organizerParticipant.user, // corrected: use organizerParticipant.user, not entire object
                            },
                            {
                                $set: { "participantsInProcess.$.amountToPay": userTotalAmount },
                            },
                            { new: true, session }
                        );
                        await Wallet.findOneAndUpdate(
                            { user: user._id },
                            { $inc: { totalBalance: p.extraChargeAmountToGet } },
                            { new: true, session }
                        );
                    } else if (invite.contribution === "Each pay their own") {
                        await Wallet.findOneAndUpdate(
                            { user: user._id },
                            { $inc: { totalBalance: -userTotalAmount + p.extraChargeAmountToGet } },
                            { new: true, session }
                        );
                        await Wallet.findOneAndUpdate(
                            { user: invite.restaurant },
                            { $inc: { totalBalance: userTotalAmount } },
                            { new: true, session }
                        );
                        p.status = "Paid";
                        p.amountToPay = userTotalAmount;

                    } else if (invite.contribution === "Participants pay organizer") {
                        const organizerParticipant = invite.participants.find(
                            (p: any) => p.user.toString() === invite.organizer.toString()
                        );
                        if (!organizerParticipant) {
                            throw new Error("Organizer not found");
                        }
                        let organizerTotalAmount = 0;
                        await Promise.all(
                            organizerParticipant.selectedMenuItems.map(async (menuItemId: any) => {
                                const menuItem = await Menu.findById(menuItemId.toString()).session(session);
                                if (!menuItem) {
                                    throw new Error(`Menu item with ID ${menuItemId} not found`);
                                }
                                const price = menuItem.price;
                                organizerTotalAmount += price;
                                return menuItem._id;
                            })
                        );
                        const eachParticipantAmount = invite.extraChargeAmount / invite.participants.length - 1;
                        await Wallet.findOneAndUpdate(
                            { user: user._id },
                            { $inc: { totalBalance: -(userTotalAmount + eachParticipantAmount) + p.extraChargeAmountToGet } },
                            { new: true, session }
                        );
                        await Wallet.findOneAndUpdate(
                            { user: invite.restaurant },
                            { $inc: { totalBalance: userTotalAmount + eachParticipantAmount } },
                            { new: true, session }
                        );
                        p.status = "Paid";
                        p.amountToPay = userTotalAmount;
                    }

                    else if (p.extraChargeAmountToPay > 0) {
                        const userWallet = await Wallet.findOne({ user: user._id }).session(session);
                        const hasToPay = userTotalAmount + p.extraChargeAmountToPay;
                        if (userWallet && userWallet.totalBalance < hasToPay) {
                            throw new Error("Insufficient balance");
                        }
                        if (invite.contribution === "Organizer pay for all") {
                            const organizerParticipant = invite.participants.find(
                                (p: any) => p.user.toString() === invite.organizer.toString()
                            );
                            if (!organizerParticipant) {
                                throw new Error("Organizer not found");
                            }
                            await UserInvitationProcessModel.findOneAndUpdate(
                                {
                                    "participantsInProcess.user": organizerParticipant.user, // corrected: use organizerParticipant.user, not entire object
                                },
                                {
                                    $set: { "participantsInProcess.$.amountToPay": userTotalAmount },
                                },
                                { new: true, session }
                            );
                            await Wallet.findOneAndUpdate(
                                { user: user._id },
                                { $inc: { totalBalance: -p.extraChargeAmountToPay } },
                                { new: true, session }
                            );
                        }
                        else if (invite.contribution === "Each pay their own") {
                            await Wallet.findOneAndUpdate(
                                { user: user._id },
                                { $inc: { totalBalance: -(userTotalAmount + p.extraChargeAmountToPay) } },
                                { new: true, session }
                            );
                            await Wallet.findOneAndUpdate(
                                { user: invite.restaurant },
                                { $inc: { totalBalance: userTotalAmount } },
                                { new: true, session }
                            );
                            p.status = "Paid";
                            p.amountToPay = userTotalAmount;

                        } else if (invite.contribution === "Participants pay organizer") {
                            const organizerParticipant = invite.participants.find(
                                (p: any) => p.user.toString() === invite.organizer.toString()
                            );
                            if (!organizerParticipant) {
                                throw new Error("Organizer not found");
                            }
                            let organizerTotalAmount = 0;
                            await Promise.all(
                                organizerParticipant.selectedMenuItems.map(async (menuItemId: any) => {
                                    const menuItem = await Menu.findById(menuItemId.toString()).session(session);
                                    if (!menuItem) {
                                        throw new Error(`Menu item with ID ${menuItemId} not found`);
                                    }
                                    const price = menuItem.price;
                                    organizerTotalAmount += price;
                                    return menuItem._id;
                                })
                            );
                            const eachParticipantAmount = invite.extraChargeAmount / invite.participants.length - 1;
                            await Wallet.findOneAndUpdate(
                                { user: user._id },
                                { $inc: { totalBalance: -(userTotalAmount + eachParticipantAmount + p.extraChargeAmountToPay) } },
                                { new: true, session }
                            );
                            await Wallet.findOneAndUpdate(
                                { user: invite.restaurant },
                                { $inc: { totalBalance: userTotalAmount + eachParticipantAmount } },
                                { new: true, session }
                            );
                            p.status = "Paid";
                            p.amountToPay = userTotalAmount;
                        }
                    }
                }
            }
        }

        // Save the updated participantsInProcess array back to the UserInvitationProcessModel
        await userInvitaionProcess.save({ session });

        // Commit the transaction if everything goes well
        await session.commitTransaction();
        session.endSession();

        return invite;
    } catch (error) {
        // Rollback the transaction if an error occurs
        await session.abortTransaction();
        session.endSession();

        throw error;
    }
};

/*
{
    "appointmentDate": "2025-06-15T18:00:00Z",
    "appointmentTime": "18:00",
    "duration": 120,
    "description": "Dinner Meetup for Networking",
    "restaurant": "68188f569cbd2e29d869038b",
    "expirationDate": "2025-06-15T22:00:00Z",
    "expirationTime": "22:00",
    "agenda": "Networking, Food, and Fun",
    "organizerMenuItems": [
        "6818914f9cbd2e29d86903b3",
        "681891579cbd2e29d86903b7"
    ],
    "participants": [
        {
            "user": "6818909f9cbd2e29d86903a7"
        },
        {
            "user": "68188fe79cbd2e29d869039b"
        }
    ],
    "contribution": "Each pay their own",
    "extraChargeType": "Participants pay organizer",
    "extraChargeAmount": 200
}


*/

// concerns
/* 
- while creating an invite one can be engaged in another invite or offer.
- organizer cannot send invite to same user and same restaurant second time.

*/

/* 
1.

*/