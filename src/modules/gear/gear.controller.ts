import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { providerGearServices } from './gear.service';
import { sendResponse } from '../../utils/sendResponse';
import { IGearQueryFilters } from './gear.interface';

const createGear = catchAsync(async (req: Request, res: Response) => {
    // console.log(req.user);
    const providerId = req.user?.id;
    const result = await providerGearServices.createGearInDB(providerId as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: 'Gear added to inventory successfully',
        data: result,
    });
});

const getAllGears = catchAsync(async (req: Request, res: Response) => {


    console.log(req.query);
    const queryFilters = req.query as IGearQueryFilters;
    const result = await providerGearServices.getAllGearsFromDB(queryFilters);

    const totalPages = Math.ceil(result.meta.total / result.meta.limit);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Gears retrieved successfully',
        data: result.data,
        meta: {
            page: result.meta.page,
            limit: result.meta.limit,
            total: result.meta.total,
            totalPages: totalPages,
        },
    });
});

const getSingleGear = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await providerGearServices.getSingleGearFromDB(id as string);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Gear details retrieved successfully',
        data: result,
    });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(req.params);
    // console.log(req.user);
    const providerId = req.user?.id;
    const result = await providerGearServices.updateGearInDB(id as string, providerId as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Gear updated successfully',
        data: result,
    });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const providerId = req.user?.id;

    const result = await providerGearServices.deleteGearFromDB(id as string, providerId as string);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Gear removed from inventory successfully',
        data: result,
    });
});

export const providerGearControllers = {
    createGear,
    getSingleGear,
    getAllGears,
    updateGear,
    deleteGear,

};