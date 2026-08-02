import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userServices } from "./user.service";



const registerUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    console.log(payload);

    const user = await userServices.registerIntoDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user,
    });
});

const getUserMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;

    const result = await userServices.getMeFromDB(userId);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'User profile retrieved successfully',
        data: result,
    });
});


export const userController = {
    registerUser,
    getUserMe

};