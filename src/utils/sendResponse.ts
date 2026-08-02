import { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export interface SendResponseData<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
}

export const sendResponse = <T>(res: Response, data: SendResponseData<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};
