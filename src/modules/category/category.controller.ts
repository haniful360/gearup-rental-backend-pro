import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CategoryServices } from './category.service';

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryServices.createCategoryInDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: 'Category created successfully',
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryServices.getAllCategoriesFromDB();

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Categories retrieved successfully',
        data: result,
    });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryServices.getSingleCategoryFromDB(id as string);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Category details retrieved successfully',
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryServices.updateCategoryInDB(id as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Category updated successfully',
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryServices.deleteCategoryFromDB(id as string);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Category deleted successfully',
        data: result,
    });
});

export const CategoryControllers = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};