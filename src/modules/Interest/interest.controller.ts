import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createInterestIntoDB } from "./interest.service";

export const createInterest  = catchAsync(async(req, res) => {
   const result = await createInterestIntoDB(req.body)
   sendResponse(res, {
      statusCode: 201,
        success: true,
        message: "Interest created successfully",
        data: result,
})
});