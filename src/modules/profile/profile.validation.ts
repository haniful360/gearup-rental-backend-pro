import { z } from 'zod/v3';

const updateProfileValidationSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
        email: z.string().email('Invalid email address').optional(),
        photo: z.string().url('Profile photo must be a valid image URL').optional().or(z.literal('')),
        bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
        phone: z.string().min(11, 'Phone number must be at least 11 digits').optional(),
        address: z.string().optional(),
        city: z.string().optional(),
    }),
});

export const ProfileValidations = {
    updateProfileValidationSchema,
};