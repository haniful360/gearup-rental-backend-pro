import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";
import httpStatus from "http-status";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await PaymentServices.createPaymentIntentInDB(
    customerId as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment checkout session generated successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.confirmPaymentInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment verified successfully",
    data: result,
  });
});

const getUserPaymentHistory = catchAsync(
  async (req: Request, res: Response) => {
    const customerId = req.user?.id;
    const result = await PaymentServices.getUserPaymentHistoryFromDB(
      customerId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User payment logs collected successfully",
      data: result,
    });
  },
);

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const customerId = req.user?.id;
  const result = await PaymentServices.getPaymentDetailsFromDB(
    id as string,
    customerId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment structure metrics retrieved successfully",
    data: result,
  });
});

export const PaymentControllers = {
  createPaymentIntent,
  confirmPayment,
  getUserPaymentHistory,
  getPaymentDetails,
};
