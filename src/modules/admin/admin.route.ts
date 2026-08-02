import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { AdminValidations } from './admin.validation';
import { AdminControllers } from './admin.controller';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

// ADMIN authorization show all users
router.get(
    '/users',
    auth(Role.ADMIN),
    validateRequest(AdminValidations.getAllUsersQuerySchema),
    AdminControllers.getAllUsers
);

// user sespened
router.patch(
    '/users/:id',
    auth(Role.ADMIN),
    validateRequest(AdminValidations.updateUserStatusValidationSchema),
    AdminControllers.updateUserStatus
);

// show all gear
router.get(
    '/gear',
    auth(Role.ADMIN),
    validateRequest(AdminValidations.getAllGearQuerySchema),
    AdminControllers.getAllGearListings
);

// show all rentall orders
router.get(
    '/rentals',
    auth(Role.ADMIN),
    validateRequest(AdminValidations.getAllRentalOrdersQuerySchema),
    AdminControllers.getAllRentalOrders
);

export const adminRoutes = router;