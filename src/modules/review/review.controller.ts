import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ReviewServices } from './review.service';
import httpStatus from 'http-status';

const createReview = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id; 
    const result = await ReviewServices.createReviewInDB(customerId as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Review posted successfully! Thank you for your feedback.',
        data: result,
    });
});

const getGearItemReviews = catchAsync(async (req: Request, res: Response) => {
    const { gearItemId } = req.params;
    const result = await ReviewServices.getGearItemReviewsFromDB(gearItemId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Reviews for this gear item retrieved successfully',
        data: result,
    });
});


export const ReviewControllers = {
    createReview,
    getGearItemReviews
};