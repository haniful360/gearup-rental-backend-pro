import { prisma } from "../../lib/prisma";
import { IProfileUpdatePayload } from "./profile.interface";

/**
 * Update user account name and upsert structural data in the related Profile table
 */

const updateMyProfileInDB = async (
  userId: string,
  payload: IProfileUpdatePayload,
) => {
  const { name, ...profileData } = payload;

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    throw new Error("User account not found!");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: {
      name: name,
      profiles: {
        upsert: {
          create: profileData,
          update: profileData,
        },
      },
    },
    include: {
      profiles: true,
    },
    omit: {
      password: true,
    },
  });
};

export const ProfileServices = {
  updateMyProfileInDB,
};
