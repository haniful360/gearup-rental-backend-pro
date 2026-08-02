import { z } from "zod/v3";

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters long" }),
  }),
});

export const AuthValidations = {
  loginValidationSchema,
};
