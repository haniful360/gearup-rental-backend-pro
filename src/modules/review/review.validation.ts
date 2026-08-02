import { z } from 'zod/v3';

const createReviewValidationSchema = z.object({
    body: z.object({
        gearItemId: z.string({
            required_error: 'Gear item ID is required to leave a review',
        }),
        rating: z.number({ required_error: 'Rating is required' })
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5'),
        comment: z.string().min(3, 'Comment must be at least 3 characters long'),
    }),
});

export const ReviewValidations = {
    createReviewValidationSchema,
};