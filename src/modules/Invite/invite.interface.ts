import { Types } from 'mongoose';

export interface IInvite {
    image?: string;
    appointmentDate: Date;
    time: string;
    duration: number; // Duration in minutes
    expirationDateTime: Date;
    agenda: string;
    participants: Types.ObjectId[]; // Array of User references
    restaurant: Types.ObjectId; // Reference to Restaurant
    menuItem: Types.ObjectId; // Reference to Menu
    contribution: 'Each pay their own' | 'Organizer pay for all' | 'Participants pay organizer';
    amount: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
    createdAt?: Date; // Automatically added by Mongoose timestamps
    updatedAt?: Date; // Automatically added by Mongoose timestamps
}