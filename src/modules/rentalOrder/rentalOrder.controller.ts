import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RentalOrderServices } from "./rentalOrder.service";
import httpStatus from "http-status";

const createRentalOrder = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await RentalOrderServices.createRentalOrderInDB(
    customerId as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order created successfully",
    data: result,
  });
});

const getUserRentalOrders = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await RentalOrderServices.getUserRentalOrdersFromDB(
    customerId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User rental orders retrieved successfully",
    data: result,
  });
});

const getRentalOrderDetails = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const customerId = req.user?.id;
    const result = await RentalOrderServices.getRentalOrderDetailsFromDB(
      id as string,
      customerId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order details retrieved successfully",
      data: result,
    });
  },
);

const getCustomerOverview = catchAsync(
  async (req: Request, res: Response) => {
    const customerId = req.user?.id;
    const result = await RentalOrderServices.getCustomerOverviewFromDB(
      customerId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Customer dashboard overview fetched successfully",
      data: result,
    });
  },
);

const getCustomerRecentOrders = catchAsync(
  async (req: Request, res: Response) => {
    const customerId = req.user?.id;
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const result = await RentalOrderServices.getCustomerRecentOrdersFromDB(
      customerId as string,
      limit,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Customer recent rental orders fetched successfully",
      data: result,
    });
  },
);

const getCustomerRecentReviews = catchAsync(
  async (req: Request, res: Response) => {
    const customerId = req.user?.id;
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const result = await RentalOrderServices.getCustomerRecentReviewsFromDB(
      customerId as string,
      limit,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Customer recent reviews fetched successfully",
      data: result,
    });
  },
);

export const RentalOrderControllers = {
  createRentalOrder,
  getUserRentalOrders,
  getRentalOrderDetails,
  getCustomerOverview,
  getCustomerRecentOrders,
  getCustomerRecentReviews,
};
