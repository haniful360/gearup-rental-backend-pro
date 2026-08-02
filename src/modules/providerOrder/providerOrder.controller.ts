import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ProviderOrderServices } from "./providerOrder.service";

const getProviderIncomingOrders = catchAsync(
  async (req: Request, res: Response) => {
    const providerId = req.user?.id;
    const result = await ProviderOrderServices.getProviderIncomingOrdersFromDB(
      providerId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider incoming rental requests fetched successfully",
      data: result,
    });
  },
);

const updateProviderOrderStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const providerId = req.user?.id;
    const { status } = req.body;

    const result = await ProviderOrderServices.updateProviderOrderStatusInDB(
      id as string,
      providerId as string,
      status,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Order status successfully transitioned to ${status}`,
      data: result,
    });
  },
);

const getProviderOverview = catchAsync(
  async (req: Request, res: Response) => {
    const providerId = req.user?.id;
    const result = await ProviderOrderServices.getProviderOverviewFromDB(
      providerId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider dashboard overview fetched successfully",
      data: result,
    });
  },
);

const getProviderRecentOrders = catchAsync(
  async (req: Request, res: Response) => {
    const providerId = req.user?.id;
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const result = await ProviderOrderServices.getProviderRecentOrdersFromDB(
      providerId as string,
      limit,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider recent rental orders fetched successfully",
      data: result,
    });
  },
);

const getProviderTopGears = catchAsync(
  async (req: Request, res: Response) => {
    const providerId = req.user?.id;
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const result = await ProviderOrderServices.getProviderTopGearsFromDB(
      providerId as string,
      limit,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider top rented gears fetched successfully",
      data: result,
    });
  },
);

const getProviderLowStockGears = catchAsync(
  async (req: Request, res: Response) => {
    const providerId = req.user?.id;
    const threshold = Math.max(Number(req.query.threshold) || 3, 1);
    const result =
      await ProviderOrderServices.getProviderLowStockGearsFromDB(
        providerId as string,
        threshold,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider low stock gear alerts fetched successfully",
      data: result,
    });
  },
);

export const ProviderOrderControllers = {
  getProviderIncomingOrders,
  updateProviderOrderStatus,
  getProviderOverview,
  getProviderRecentOrders,
  getProviderTopGears,
  getProviderLowStockGears,
};
