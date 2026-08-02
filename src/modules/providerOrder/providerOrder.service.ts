import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PAID,
  OrderStatus.PICKED_UP,
];

const PENDING_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
];

const providerOrderWhere = (providerId: string) => ({
  gearItem: {
    providerId: providerId,
  },
});

// View incoming rental orders belonging to the provider's gears
const getProviderIncomingOrdersFromDB = async (providerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: providerOrderWhere(providerId),
    include: {
      gearItem: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};


/**
 * Update incoming rental order status with strict business rules
 */
const updateProviderOrderStatusInDB = async (
  orderId: string,
  providerId: string,
  status: OrderStatus,
) => {
  // 1. Fetch the order and verify the provider owns the associated gear item
  const existingOrder = await prisma.rentalOrder.findFirst({
    where: {
      id: orderId,
      gearItem: {
        providerId: providerId,
      },
    },
  });

  if (!existingOrder) {
    throw new Error(
      'No associated or authorized rental order found under your gear profile!',
    );
  }

  // 2. Simple Check: Provider can only update status if payment status is PAID
  if (existingOrder.paymentStatus !== PaymentStatus.PAID) {
    throw new Error(
      'You cannot update the status of this order until the customer completes the payment!',
    );
  }


  // 4. Update order status in the database directly
  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status },
  });

  return updatedOrder;
};

const getProviderRecentOrdersFromDB = async (
  providerId: string,
  limit: number,
) => {
  return await prisma.rentalOrder.findMany({
    where: providerOrderWhere(providerId),
    include: {
      gearItem: {
        select: { id: true, title: true, images: true },
      },
      customer: {
        select: { id: true, name: true, email: true },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

const getProviderTopGearsFromDB = async (providerId: string, limit: number) => {
  const result = await prisma.gearItem.findMany({
    where: { providerId },
    include: {
      _count: { select: { orders: true } },
      category: { select: { id: true, name: true } },
    },
    orderBy: { orders: { _count: "desc" } },
    take: limit,
  });

  return result.map(({ _count, ...gear }) => ({
    ...gear,
    rentalCount: _count.orders,
  }));
};

const getProviderLowStockGearsFromDB = async (
  providerId: string,
  threshold: number,
) => {
  return await prisma.gearItem.findMany({
    where: {
      providerId,
      stock: { lte: threshold },
    },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { stock: "asc" },
  });
};

const getProviderOverviewFromDB = async (providerId: string) => {
  const where = providerOrderWhere(providerId);

  const [
    totalGearListings,
    totalOrders,
    activeRentals,
    completedRentals,
    pendingOrders,
    paidRevenue,
    lowStockGearCount,
    featuredGearCount,
  ] = await Promise.all([
    prisma.gearItem.count({ where: { providerId } }),
    prisma.rentalOrder.count({ where }),
    prisma.rentalOrder.count({
      where: { ...where, status: { in: ACTIVE_ORDER_STATUSES } },
    }),
    prisma.rentalOrder.count({
      where: { ...where, status: OrderStatus.RETURNED },
    }),
    prisma.rentalOrder.count({
      where: { ...where, status: { in: PENDING_ORDER_STATUSES } },
    }),
    prisma.rentalOrder.aggregate({
      where: { ...where, paymentStatus: PaymentStatus.PAID },
      _sum: { totalPrice: true },
    }),
    prisma.gearItem.count({
      where: { providerId, stock: { lte: 3 } },
    }),
    prisma.gearItem.count({ where: { providerId, isFeature: true } }),
  ]);

  const recentOrders = await getProviderRecentOrdersFromDB(providerId, 5);
  const topGears = await getProviderTopGearsFromDB(providerId, 5);

  return {
    stats: {
      totalGearListings,
      totalOrders,
      activeRentals,
      completedRentals,
      pendingOrders,
      totalRevenue: paidRevenue._sum.totalPrice ?? 0,
      lowStockGearCount,
      featuredGearCount,
    },
    recentOrders,
    topGears,
  };
};

export const ProviderOrderServices = {
  getProviderIncomingOrdersFromDB,
  updateProviderOrderStatusInDB,
  getProviderOverviewFromDB,
  getProviderRecentOrdersFromDB,
  getProviderTopGearsFromDB,
  getProviderLowStockGearsFromDB,
};
