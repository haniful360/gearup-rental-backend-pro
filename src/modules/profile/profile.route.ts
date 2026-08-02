import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProfileControllers } from "./profile.controller";
import { Role } from "../../../generated/prisma/enums";
import { ProfileValidations } from "./profile.validation";
import {
  parseProfilePhoto,
  uploadSingleImage,
} from "../../middlewares/fileUpload";

import { userController } from "../user/user.controller";

const router = Router();

// GET: /api/profile or /api/profile/me
router.get(
  "/",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  userController.getUserMe,
);

router.get(
  "/me",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  userController.getUserMe,
);

// PATCH: /api/profile or /api/profile/update
router.patch(
  "/",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  uploadSingleImage,
  parseProfilePhoto,
  validateRequest(ProfileValidations.updateProfileValidationSchema),
  ProfileControllers.updateMyProfile,
);

router.patch(
  "/update",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  uploadSingleImage,
  parseProfilePhoto,
  validateRequest(ProfileValidations.updateProfileValidationSchema),
  ProfileControllers.updateMyProfile,
);

export const profileRoutes = router;
