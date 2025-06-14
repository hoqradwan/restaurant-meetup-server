import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { startMeetupIntoDB, stopMeetupIntoDB } from "./timer.service"

export const startMeetup = catchAsync(async (req, res) => {
  // Pass the request body to the startMeetupIntoDB function for processing
  const result = await startMeetupIntoDB();

  // Send the response back to the client
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Meetup started successfully",
    data: result,
  });
});
export const stopMeetup = catchAsync(async (req, res) => {
  // Pass the request body to the startMeetupIntoDB function for processing
  const result = await stopMeetupIntoDB();

  // Send the response back to the client
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Meetup ended successfully",
    data: result,
  });
});