import { z } from 'zod/v3';

const updateUserStatusValidationSchema = z.object({
    body: z.object({
        isSuspended: z.boolean({
            required_error: 'Suspension status boolean is required',
        }),
        reason: z.string().optional(),
    }),
});

const getAllUsersQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        role: z.enum(['CUSTOMER', 'PROVIDER', 'ADMIN']).optional(),
        status: z.enum(['active', 'suspended']).optional(),
        searchTerm: z.string().optional(),
    }).passthrough(),
});

const getAllGearQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        searchTerm: z.string().optional(),
    }).passthrough(),
});

const getAllRentalOrdersQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }).passthrough(),
});

export const AdminValidations = {
    updateUserStatusValidationSchema,
    getAllUsersQuerySchema,
    getAllGearQuerySchema,
    getAllRentalOrdersQuerySchema,
};