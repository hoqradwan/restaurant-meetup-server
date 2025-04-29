import { Types } from 'mongoose';

export interface IInvite {
    image?: string;
    appointmentDate: Date;
    time: string;
    duration: number; 
    expirationDateTime: Date;
    agenda: string;
    participants: Types.ObjectId[]; 
    restaurant: Types.ObjectId; 
    menuItem: Types.ObjectId; 
    contribution: 'Each pay their own' | 'Organizer pay for all' | 'Participants pay organizer';
    amount: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
}