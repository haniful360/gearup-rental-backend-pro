import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { OrderStatus, Role } from "../../../generated/prisma/enums";
import {
  IAdminGearQuery,
  IAdminRentalQuery,
  IAdminUserQuery,
} from "./admin.interface";

const computePagination = (page?: string, limit?: string) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.max(Number(limit) || 10, 1);
  return {
    page: currentPage,
    limit: currentLimit,
    skip: (currentPage - 1) * currentLimit,
  };
};

// GET /api/admin/users
const getAllUsersFromDB = async (query: IAdminUserQuery = {}) => {
  const { role, status, searchTerm } = query || {};
  const { page, limit, skip } = computePagination(query?.page, query?.limit);

  const andConditions: Prisma.UserWhereInput[] = [];

  if (role) {
    andConditions.push({ role: role as Role });
  }

  if (status) {
    andConditions.push({ isSuspended: status === "suspended" });
  }

  if (searchTerm && searchTerm.trim() !== "") {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const data = await prisma.user.findMany({
    where,
    omit: {
      password: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.user.count({ where });

  return { meta: { page, limit, total }, data };
};

// PATCH /api/admin/users/:id
const updateUserStatusInDB = async (
  userId: string,
  isSuspended: boolean,
  reason?: string,
) => {
  // Check if target user exists before updating status
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    throw new Error("Target user account not found!");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: {
      isSuspended,
      suspensionReason: isSuspended ? reason : null,
    },
    omit: {
      password: true,
    },
  });
};

//  GET /api/admin/gear
const getAllGearListingsFromDB = async (query: IAdminGearQuery = {}) => {
  const { searchTerm } = query || {};
  const { page, limit, skip } = computePagination(query?.page, query?.limit);

  const andConditions: Prisma.GearItemWhereInput[] = [];

  if (searchTerm && searchTerm.trim() !== "") {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { brand: { contains: searchTerm, mode: "insensitive" } },
        { location: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.GearItemWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const data = await prisma.gearItem.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.gearItem.count({ where });

  return { meta: { page, limit, total }, data };
};

//  GET /api/admin/rentals
const getAllRentalOrdersFromDB = async (query: IAdminRentalQuery = {}) => {
  const { page, limit, skip } = computePagination(query?.page, query?.limit);

  const data = await prisma.rentalOrder.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      gearItem: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.rentalOrder.count();

  return { meta: { page, limit, total }, data };
};

const getRecentRentalsFromDB = async (limit: number) => {
  return await prisma.rentalOrder.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      gearItem: {
        select: { id: true, title: true, images: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

const getRecentUsersFromDB = async (limit: number) => {
  return await prisma.user.findMany({
    omit: {
      password: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

// GET /api/admin/payment-stats
const getPaymentStatsFromDB = async () => {
  const [totalPayments, paidRevenue, paid, pending, failed, refunded] =
    await Promise.all([
      prisma.payment.count(),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: "PAID" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.payment.count({ where: { status: "REFUNDED" } }),
    ]);

  return {
    totalPayments,
    totalRevenue: paidRevenue._sum.amount ?? 0,
    byStatus: {
      PAID: paid,
      PENDING: pending,
      FAILED: failed,
      REFUNDED: refunded,
    },
  };
};

// GET /api/admin/top-gears
const getTopGearsFromDB = async (limit: number) => {
  const result = await prisma.gearItem.findMany({
    include: {
      _count: { select: { orders: true } },
      category: { select: { id: true, name: true } },
      provider: { select: { id: true, name: true } },
    },
    orderBy: { orders: { _count: "desc" } },
    take: limit,
  });

  return result.map(({ _count, ...gear }) => ({
    ...gear,
    rentalCount: _count.orders,
  }));
};

// GET /api/admin/overview
const getAdminOverviewFromDB = async () => {
  const activeOrderStatuses: OrderStatus[] = [
    OrderStatus.PLACED,
    OrderStatus.CONFIRMED,
    OrderStatus.PAID,
    OrderStatus.PICKED_UP,
  ];

  const [
    totalUsers,
    totalProviders,
    totalCustomers,
    totalSuspendedUsers,
    totalGearListings,
    totalActiveGear,
    totalFeaturedGear,
    totalRentals,
    totalActiveRentals,
    totalCompletedRentals,
    totalCategories,
    totalReviews,
    paidRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { isSuspended: true } }),
    prisma.gearItem.count(),
    prisma.gearItem.count({ where: { isAvailable: true } }),
    prisma.gearItem.count({ where: { isFeature: true } }),
    prisma.rentalOrder.count(),
    prisma.rentalOrder.count({
      where: { status: { in: activeOrderStatuses } },
    }),
    prisma.rentalOrder.count({ where: { status: "RETURNED" } }),
    prisma.category.count(),
    prisma.review.count(),
    prisma.rentalOrder.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalPrice: true },
    }),
  ]);

  const recentRentals = await getRecentRentalsFromDB(5);
  const recentUsers = await getRecentUsersFromDB(5);

  return {
    stats: {
      totalUsers,
      totalProviders,
      totalCustomers,
      totalSuspendedUsers,
      totalGearListings,
      totalActiveGear,
      totalFeaturedGear,
      totalRentals,
      totalActiveRentals,
      totalCompletedRentals,
      totalRevenue: paidRevenue._sum.totalPrice ?? 0,
      totalCategories,
      totalReviews,
    },
    recentRentals,
    recentUsers,
  };
};

export const AdminServices = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllGearListingsFromDB,
  getAllRentalOrdersFromDB,
  getAdminOverviewFromDB,
  getRecentRentalsFromDB,
  getRecentUsersFromDB,
  getPaymentStatsFromDB,
  getTopGearsFromDB,
};
