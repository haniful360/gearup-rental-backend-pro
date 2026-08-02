import { Router } from "express";
import { providerGearControllers } from "./gear.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";
import { gearValidations } from "./gear.validation";
import { Role } from "../../../generated/prisma/enums";
import {
  parseGearFormData,
  uploadMultipleImages,
} from "../../middlewares/fileUpload";

const router = Router();

// public route

router.get(
  "/get-gears",
  validateRequest(gearValidations.getAllGearQuerySchema),
  providerGearControllers.getAllGears,
);

// Get gear details
router.get("/:id", providerGearControllers.getSingleGear);



// provider manage the Gear

router.post(
  "/create",
  auth(Role.PROVIDER),
  uploadMultipleImages,
  parseGearFormData,
  validateRequest(gearValidations.createGearValidationSchema),
  providerGearControllers.createGear,
);

router.patch(
  "/:id",
  auth(Role.PROVIDER),
  uploadMultipleImages,
  parseGearFormData,
  validateRequest(gearValidations.updateGearValidationSchema),
  providerGearControllers.updateGear,
);

router.delete("/:id", auth(Role.PROVIDER), providerGearControllers.deleteGear);



export const gearRoutes = router;
