import { JwtPayload, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { LoginUserPayload } from "./auth.interface";

/**
 * 1. User Login Service
 */
const loginUser = async (payload: LoginUserPayload) => {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password. Please try again!");
    }

    // check your account is suspended or not
    if (user.isSuspended) {
        throw new Error("Your account has been suspended by an Admin.");
    }

    // password check
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new Error("Password does not match");
    }

    // JWT Payload create
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    // Access Token and Refresh Token genrrate
    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_token as string,
        config.jwt_access_token_expire_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_token as string,
        config.jwt_refresh_token_expire_in as SignOptions,
    );

    return { accessToken, refreshToken };
};

/**
 * 2. Refresh Token Service
 */
const refreshToken = async (token: string) => {
    const verificationToken = jwtUtils.verifyToken(
        token,
        config.jwt_refresh_token as string,
    );

    if (!verificationToken.success) {
        throw new Error(verificationToken.error || "Invalid refresh token");
    }

    const { id } = verificationToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id,
        },
    });

    if (user.isSuspended) {
        throw new Error("Your account is suspended.");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_token as string,
        config.jwt_access_token_expire_in as SignOptions,
    );

    return { accessToken };
};


export const authServices = {
    loginUser,
    refreshToken,
};