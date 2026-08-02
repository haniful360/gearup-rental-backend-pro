import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { authServices } from './auth.service';


const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await authServices.loginUser(req.body);
    const { accessToken, refreshToken } = result;

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'User logged in successfully',
        data: {
            accessToken, refreshToken
        },
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken } = await authServices.refreshToken(refreshToken);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Access token generated successfully',
        data: { accessToken },
    });
});

export const authControllers = {
    loginUser,
    refreshToken,
};