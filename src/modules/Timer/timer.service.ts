import mongoose from 'mongoose';
import { Timer } from './timer.model';

let timerStartTime : any = null;
let timerEndTime : any = null;

// Start Meetup Service with transaction
export const startMeetupIntoDB = async (userId: string, meetupData: any) => {
    const {} = meetupData;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Save the start time
    timerStartTime = Date.now();

    // You can perform any other write operations here, for example, saving user data or logging
    const timerRecord = new Timer({
      meetupId: meetupData.meetupId,  // Example of how you might use the data passed
      meetupModel: meetupData.meetupModel,
      startTime: timerStartTime,
      bookingType: meetupData.bookingType,
    });

    // Save the timer record within the transaction
    await timerRecord.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { startTime: timerStartTime };
  } catch (error : any) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Failed to start meetup: ${error.message}`);
  }
};

// Stop Meetup Service with transaction
export const stopMeetupIntoDB = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!timerStartTime) {
      throw new Error('Timer has not started yet');
    }

    // Capture the end time when the timer is stopped
    timerEndTime = Date.now();
    const elapsedTimeInSeconds = (timerEndTime - timerStartTime) / 1000; // in seconds

    const hours = Math.floor(elapsedTimeInSeconds / 3600);
    const minutes = Math.floor((elapsedTimeInSeconds % 3600) / 60);
    const seconds = Math.floor(elapsedTimeInSeconds % 60);

    // You can also save the stop time and the elapsed time in the database
    const updatedTimer = await Timer.findOneAndUpdate(
      { startTime: timerStartTime },
      { endTime: timerEndTime, duration: elapsedTimeInSeconds },
      { new: true, session }
    );

    // Return the elapsed time in the format "Xh Ym Zs"
    const elapsedTime = `${hours}h ${minutes}m ${seconds}s`;

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { elapsedTime, updatedTimer };
  } catch (error : any) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Failed to stop meetup: ${error.message}`);
  }
};
