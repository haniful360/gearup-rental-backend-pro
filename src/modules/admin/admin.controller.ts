import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AdminServices } from './admin.service';
import httpStatus from 'http-status';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllUsersFromDB();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All registered users fetched successfully for administration management',
        data: result,
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isSuspended, reason } = req.body;

    const result = await AdminServices.updateUserStatusInDB(id as string, isSuspended, reason);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `User status successfully adjusted to ${isSuspended ? 'Suspended' : 'Active'}`,
        data: result,
    });
});

const getAllGearListings = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllGearListingsFromDB();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Global gear items repository retrieved successfully',
        data: result,
    });
});

const getAllRentalOrders = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllRentalOrdersFromDB();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All comprehensive rental orders history retrieved successfully',
        data: result,
    });
});

export const AdminControllers = {
    getAllUsers,
    updateUserStatus,
    getAllGearListings,
    getAllRentalOrders,
};