import { z } from 'zod/v3';


const updateProviderOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([
      'PLACED',
      'CONFIRMED',
      'PAID',
      'PICKED_UP',
      'RETURNED',
      'CANCELLED',
      'REJECTED'
    ], {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid order status value'
    }),
  }),
});

export const ProviderOrderValidations = {
  updateProviderOrderStatusValidationSchema,
};