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

const router = Router();

// PATCH: /api/profile
router.patch(
  "/update",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  uploadSingleImage,
  parseProfilePhoto,
  validateRequest(ProfileValidations.updateProfileValidationSchema),
  ProfileControllers.updateMyProfile,
);

export const profileRoutes = router;
