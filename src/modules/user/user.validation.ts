import { z } from "zod/v3";
import { Role } from "../../../generated/prisma/enums";

const registerUserValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(3, { message: "Name must be at least 3 characters" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum([Role.ADMIN, Role.CUSTOMER, Role.PROVIDER], {
      required_error: "Role is required",
    }),
  }),
});

export const UserValidations = {
  registerUserValidationSchema,
};
