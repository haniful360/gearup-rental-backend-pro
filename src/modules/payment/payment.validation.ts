import { z } from "zod/v3";

const createPaymentIntentValidationSchema = z.object({
  body: z.object({
    rentalOrderId: z.string({
      required_error: "Rental Order ID is required to initiate payment",
    }),
  }),
});

const confirmPaymentValidationSchema = z.object({
  body: z.object({
    sessionId: z.string({
      required_error: "Stripe Session ID is required for verification",
    }),
  }),
});

export const PaymentValidations = {
  createPaymentIntentValidationSchema,
  confirmPaymentValidationSchema,
};
