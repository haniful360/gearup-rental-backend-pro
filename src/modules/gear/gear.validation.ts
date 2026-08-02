import { z } from 'zod/v3';

const createGearValidationSchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Title is required' }),
        description: z.string({ required_error: 'Description is required' }),
        pricePerDay: z.number({ required_error: 'Price per day is required' }).positive(),
        location: z.string({ required_error: 'Location is required' }),
        brand: z.string({ required_error: 'Brand is required' }),
        stock: z.number().int().nonnegative().optional(),
        isFeature: z.boolean().optional(),
        images: z.array(z.string().url()).optional(),
        categoryId: z.string({ required_error: 'Category ID is required' }),
    }),
});

const updateGearValidationSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        pricePerDay: z.number().positive().optional(),
        location: z.string().optional(),
        brand: z.string().optional(),
        stock: z.number().int().nonnegative().optional(),
        isAvailable: z.boolean().optional(),
        isFeature: z.boolean().optional(),
        images: z.array(z.string().url()).optional(),
        categoryId: z.string().optional(),
    }),
});

const getAllGearQuerySchema = z.object({
    query: z.object({
        searchTerm: z.string().optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        availability: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
    }).passthrough()
});

export const gearValidations = {
    createGearValidationSchema,
    updateGearValidationSchema,
    getAllGearQuerySchema
};