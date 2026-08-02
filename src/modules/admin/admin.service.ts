import { prisma } from "../../lib/prisma";

// GET /api/admin/users
const getAllUsersFromDB = async () => {
  return await prisma.user.findMany({
    omit: {
      password: true,
    },
    orderBy: { createdAt: "desc" },
  });
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
const getAllGearListingsFromDB = async () => {
  return await prisma.gearItem.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

//  GET /api/admin/rentals
const getAllRentalOrdersFromDB = async () => {
  return await prisma.rentalOrder.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      gearItem: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const AdminServices = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllGearListingsFromDB,
  getAllRentalOrdersFromDB,
};
