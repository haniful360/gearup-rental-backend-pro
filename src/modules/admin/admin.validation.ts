import { z } from 'zod/v3';

const updateUserStatusValidationSchema = z.object({
    body: z.object({
        isSuspended: z.boolean({
            required_error: 'Suspension status boolean is required',
        }),
        reason: z.string().optional(),
    }),
});

export const AdminValidations = {
    updateUserStatusValidationSchema,
};