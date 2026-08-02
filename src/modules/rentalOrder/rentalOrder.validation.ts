import { z } from "zod/v3";

const createRentalOrderValidationSchema = z.object({
  body: z.object({
    gearItemId: z.string({
      required_error: "Gear Item ID is required",
    }),
    startDate: z
      .string({
        required_error: "Start date is required",
      })
      .datetime({ message: "Invalid start date format (ISO string expected)" }),
    endDate: z
      .string({
        required_error: "End date is required",
      })
      .datetime({ message: "Invalid end date format (ISO string expected)" }),
    totalPrice: z
      .number({
        required_error: "Total price is required",
      })
      .positive("Total price must be a positive number"),
    quantity: z
      .number()
      .int()
      .positive("Quantity must be at least 1")
      .default(1),
  }),
});

const getRentalOrderByIdValidationSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Rental Order ID is required in params",
    }),
  }),
});

export const RentalOrderValidations = {
  createRentalOrderValidationSchema,
  getRentalOrderByIdValidationSchema,
};
