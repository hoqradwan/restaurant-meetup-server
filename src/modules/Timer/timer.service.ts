let timerStartTime : any = null;
 let timerEndTime : any = null;

export const startMeetupIntoDB = async () => {
    timerStartTime = Date.now(); // Save the start time
    return { startTime: timerStartTime };
}


 export const stopMeetupIntoDB = () => {
  if (!timerStartTime) {
    throw new Error('Timer has not started yet');
  }

  // Capture the end time when the timer is stopped
  timerEndTime = Date.now();
  const elapsedTimeInSeconds = (timerEndTime - timerStartTime) / 1000; // in seconds

  const hours = Math.floor(elapsedTimeInSeconds / 3600);
  const minutes = Math.floor((elapsedTimeInSeconds % 3600) / 60);
  const seconds = Math.floor(elapsedTimeInSeconds % 60);

  // Return the elapsed time in the format "Xh Ym Zs"
  return {
    message: 'Meetup ended successfully',
    elapsedTime: `${hours}h ${minutes}m ${seconds}s`,
  };
};