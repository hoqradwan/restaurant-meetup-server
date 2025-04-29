import Invite from "./invite.model"

export const createInviteIntoDB = async (inviteData: any, restaurantId: string) => {
    const invite = await Invite.create({ ...inviteData, restaurant: restaurantId });
    return invite;
}