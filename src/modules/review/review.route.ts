import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { ReviewValidations } from './review.validation';
import { ReviewControllers } from './review.controller';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

// reviews
router.post(
    '/create',
    auth(Role.CUSTOMER),
    validateRequest(ReviewValidations.createReviewValidationSchema),
    ReviewControllers.createReview
);

// get all reviews for a specific gear item reviews
router.get('/:gearItemId', ReviewControllers.getGearItemReviews);

export const reviewRoutes = router;