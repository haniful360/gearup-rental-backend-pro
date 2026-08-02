
import { OrderStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';

const createReviewInDB = async (
    customerId: string,
    payload: { gearItemId: string; rating: number; comment: string }
) => {
    const { gearItemId, rating, comment } = payload;

    // Verify that this customer actually rented this specific gear item and returned it
    const completedOrder = await prisma.rentalOrder.findFirst({
        where: {
            customerId: customerId,
            gearItemId: gearItemId,
            status: OrderStatus.COMPLETED,
        },
    });

    if (!completedOrder) {
        throw new Error(
            'You are not authorized to review this item. You can only leave reviews after renting and returning the gear!'
        );
    }

    // 2. Prevent duplicate reviews for the same order 
    const existingReview = await prisma.review.findFirst({
        where: {
            customerId,
            gearItemId,
        },
    });

    if (existingReview) {
        throw new Error('You have already submitted a review for this gear item!');
    }

    // Create the review inside the database
    const result = await prisma.review.create({
        data: {
            customerId,
            gearItemId,
            rating,
            comment,
        },
    });

    return result;
};

// Get all reviews for a specific gear item
const getGearItemReviewsFromDB = async (gearItemId: string) => {
    return await prisma.review.findMany({
        where: {
            gearItemId: gearItemId,
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const ReviewServices = {
    createReviewInDB,
    getGearItemReviewsFromDB,
};
