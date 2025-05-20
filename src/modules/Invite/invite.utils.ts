import { UserModel } from "../user/user.model";

export const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error("Invalid time format");
    }
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedTime = `${formattedHours}:${formattedMinutes}`;
    return formattedTime;
};

export function generateTicketNumber(): string {
    // Generate a random number between 100000 and 999999 (6 digits)
    const ticketNumber = Math.floor(Math.random() * 900000) + 100000;
  
    return ticketNumber.toString();
  }

export  const processingParticipantData = async (participants: any, eachParticipantAmount: any, session: any) => {
    await Promise.all(
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
}
    