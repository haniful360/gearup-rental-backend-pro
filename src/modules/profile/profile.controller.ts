import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProfileServices } from "./profile.service";
import { IProfileUpdatePayload } from "./profile.interface";
import httpStatus from "http-status";

/**
 * authenticated user can update profile
 */
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const updatePayload: IProfileUpdatePayload = req.body;

  const result = await ProfileServices.updateMyProfileInDB(
    userId as string,
    updatePayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

export const ProfileControllers = {
  updateMyProfile,
};
