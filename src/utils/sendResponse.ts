import { Response } from "express";
import { TResponse } from "../interface/global.interface";

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data?.message,
    pagination: data.pagination,
    data: data.data,
  });
};

export default sendResponse;

/* 
Things to do in the later days, developing a clear cut roadmap for the project

19 - clear the auth
20 - off day
21 - clear the invite process
22 - clear the offer process
23 - clear the get processes (schedule wise sorting)
24 - notification group chat audio video call
25 - 
*/
