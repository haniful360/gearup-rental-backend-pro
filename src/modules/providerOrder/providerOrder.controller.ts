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

export const ProviderOrderControllers = {
  getProviderIncomingOrders,
  updateProviderOrderStatus,
};
