import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { AdminValidations } from './admin.validation';
import { AdminControllers } from './admin.controller';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

// ADMIN authorization show all users
router.get('/users', auth('ADMIN'), AdminControllers.getAllUsers);

// user sespened
router.patch(
    '/users/:id',
    auth(Role.ADMIN),
    validateRequest(AdminValidations.updateUserStatusValidationSchema),
    AdminControllers.updateUserStatus
);

// show all gear
router.get('/gear', auth(Role.ADMIN), AdminControllers.getAllGearListings);

// show all rentall orders
router.get('/rentals', auth(Role.ADMIN), AdminControllers.getAllRentalOrders);

export const adminRoutes = router;