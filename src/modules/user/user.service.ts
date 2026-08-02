import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { IRegisterUserPayload } from "./user.interface";

const registerIntoDB = async (payload: IRegisterUserPayload) => {
  const { name, email, password, role } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  // Create user without password
  const result = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const getMeFromDB = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is missing or undefined!");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      profiles: true,
    },
    omit: {
      password: true,
    },
  });

  if (user.isSuspended) {
    throw new Error("Your account is currently suspended.");
  }

  return user;
};

export const userServices = {
  registerIntoDB,
  getMeFromDB,
};
