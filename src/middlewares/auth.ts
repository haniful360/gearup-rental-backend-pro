import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        role: Role;
        id: string;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error("Unauthorized, you are not logged in");
    }

    const verifiedToken = jwtUtils.verifyToken(
      token,
      config.jwt_access_token as string,
    );

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { email, name, role, id } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
      throw new Error(
        "Forbidden Access, You don't have permission to access this resource",
      );
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id,
        email,
      },
    });

    if (!user) {
      throw new Error("User not found, Please login again");
    }

    if (user.isSuspended) {
      throw new Error("User is suspended, Please contact support");
    }

    req.user = { email, name, role: role as Role, id };

    next();
  });
};
