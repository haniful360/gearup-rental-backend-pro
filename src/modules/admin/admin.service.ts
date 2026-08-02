import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { Role } from "../../../generated/prisma/enums";
import {
  IAdminGearQuery,
  IAdminRentalQuery,
  IAdminUserQuery,
} from "./admin.interface";

const computePagination = (page?: string, limit?: string) => {
  const currentPage = Math.max(Number(page), 1);
  const currentLimit = Math.max(Number(limit), 1);
  return {
    page: currentPage,
    limit: currentLimit,
    skip: (currentPage - 1) * currentLimit,
  };
};

// GET /api/admin/users
const getAllUsersFromDB = async (query: IAdminUserQuery) => {
  const { role, status, searchTerm } = query;
  const { page, limit, skip } = computePagination(query.page, query.limit);

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
const getAllGearListingsFromDB = async (query: IAdminGearQuery) => {
  const { searchTerm } = query;
  const { page, limit, skip } = computePagination(query.page, query.limit);

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
const getAllRentalOrdersFromDB = async (query: IAdminRentalQuery) => {
  const { page, limit, skip } = computePagination(query.page, query.limit);

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

export const AdminServices = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllGearListingsFromDB,
  getAllRentalOrdersFromDB,
};
