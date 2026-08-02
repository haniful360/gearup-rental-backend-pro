import { Router } from 'express';
import { authControllers } from './auth.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { AuthValidations } from './auth.validation';

const router = Router();

// POST /api/auth/login

router.post(
  "/login",
  validateRequest(AuthValidations.loginValidationSchema),
  authControllers.loginUser,
);

// POST /api/auth/refresh-token

router.post('/refresh-token', authControllers.refreshToken);

export const authRoutes = router;