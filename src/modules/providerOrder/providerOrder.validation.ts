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

const getRecentQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional(),
  }).passthrough(),
});

const getLowStockQuerySchema = z.object({
  query: z.object({
    threshold: z.string().optional(),
  }).passthrough(),
});

export const ProviderOrderValidations = {
  updateProviderOrderStatusValidationSchema,
  getRecentQuerySchema,
  getLowStockQuerySchema,
};