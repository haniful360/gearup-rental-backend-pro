import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateRentalOrderPayload } from "./rentalOrder.interface";

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PAID,
  OrderStatus.PICKED_UP,
];

const CANCELLED_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.REJECTED,
];

// Create a new rental order
// import { OrderStatus, PaymentStatus } from "@prisma/client";

const createRentalOrderInDB = async (
  customerId: string,
  payload: ICreateRentalOrderPayload,
) => {
  // 1. Fetch the gear item
  const gearItem = await prisma.gearItem.findUnique({
    where: { id: payload.gearItemId },
  });

  if (!gearItem) {
    throw new Error("Gear item not found!");
  }

  // 2. Just check if stock is available, do NOT deduct stock yet
  const requestedQuantity = payload.quantity || 1;
  if (gearItem.stock < requestedQuantity || !gearItem.isAvailable) {
    throw new Error(
      `Insufficient stock! Only ${gearItem.stock} items are available for rent.`,
    );
  }

  // 3. Create the new rental order with default PLACED status (No $transaction needed here)
  const rentalOrder = await prisma.rentalOrder.create({
    data: {
      gearItemId: payload.gearItemId,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      totalPrice: payload.totalPrice,
      quantity: requestedQuantity,
      customerId: customerId,
      status: OrderStatus.PLACED,        // Explicitly passing or relies on schema default
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  return rentalOrder;
};

//  Get logged-in user's rental orders

const getUserRentalOrdersFromDB = async (customerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: {
      customerId,
    },
    include: {
      gearItem: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

// Get specific rental order details
const getRentalOrderDetailsFromDB = async (
  rentalOrderId: string,
  customerId: string,
) => {
  const result = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: {
      gearItem: true,
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!result) {
    throw new Error("Rental order not found!");
  }

  // ensure user can only view their own rental orders
  if (result.customerId !== customerId) {

    throw new Error("You are not authorized to view this rental order!");
  }

  return result;
};

const getCustomerRecentOrdersFromDB = async (
  customerId: string,
  limit: number,
) => {
  return await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      gearItem: {
        select: { id: true, title: true, images: true, pricePerDay: true },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

const getCustomerRecentReviewsFromDB = async (
  customerId: string,
  limit: number,
) => {
  return await prisma.review.findMany({
    where: { customerId },
    include: {
      gearItem: {
        select: { id: true, title: true, images: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

const getCustomerOverviewFromDB = async (customerId: string) => {
  const [
    totalOrders,
    activeRentals,
    completedRentals,
    cancelledRentals,
    pendingPayments,
    totalSpent,
    totalReviews,
    distinctGearsRented,
  ] = await Promise.all([
    prisma.rentalOrder.count({ where: { customerId } }),
    prisma.rentalOrder.count({
      where: { customerId, status: { in: ACTIVE_ORDER_STATUSES } },
    }),
    prisma.rentalOrder.count({
      where: { customerId, status: OrderStatus.RETURNED },
    }),
    prisma.rentalOrder.count({
      where: { customerId, status: { in: CANCELLED_ORDER_STATUSES } },
    }),
    prisma.rentalOrder.count({
      where: { customerId, paymentStatus: PaymentStatus.PENDING },
    }),
    prisma.rentalOrder.aggregate({
      where: { customerId, paymentStatus: PaymentStatus.PAID },
      _sum: { totalPrice: true },
    }),
    prisma.review.count({ where: { customerId } }),
    prisma.rentalOrder.groupBy({
      by: ["gearItemId"],
      where: { customerId },
    }),
  ]);

  const recentOrders = await getCustomerRecentOrdersFromDB(customerId, 5);
  const recentReviews = await getCustomerRecentReviewsFromDB(customerId, 5);

  return {
    stats: {
      totalOrders,
      activeRentals,
      completedRentals,
      cancelledRentals,
      pendingPayments,
      totalSpent: totalSpent._sum.totalPrice ?? 0,
      totalReviews,
      distinctGearsRented: distinctGearsRented.length,
    },
    recentOrders,
    recentReviews,
  };
};

const cancelRentalOrderInDB = async (
  rentalOrderId: string,
  customerId: string,
) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
  });

  if (!rentalOrder) {
    throw new Error("Rental order not found!");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new Error("You are not authorized to cancel this order!");
  }

  if (rentalOrder.paymentStatus === PaymentStatus.PAID) {
    throw new Error("Cannot cancel an order that has already been paid for!");
  }

  if (
    rentalOrder.status === OrderStatus.CANCELLED ||
    rentalOrder.status === OrderStatus.REJECTED
  ) {
    throw new Error("Order is already cancelled or rejected!");
  }

  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: rentalOrderId },
    data: {
      status: OrderStatus.CANCELLED,
      paymentStatus: PaymentStatus.FAILED,
    },
  });

  return updatedOrder;
};

export const RentalOrderServices = {
  createRentalOrderInDB,
  getUserRentalOrdersFromDB,
  getRentalOrderDetailsFromDB,
  getCustomerOverviewFromDB,
  getCustomerRecentOrdersFromDB,
  getCustomerRecentReviewsFromDB,
  cancelRentalOrderInDB,
};
