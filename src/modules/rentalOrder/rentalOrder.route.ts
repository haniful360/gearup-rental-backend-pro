import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";
import { RentalOrderValidations } from "./rentalOrder.validation";
import { RentalOrderControllers } from "./rentalOrder.controller";

const router = Router();

//Create new rental order
router.post(
  "/create",
  auth(),
  validateRequest(RentalOrderValidations.createRentalOrderValidationSchema),
  RentalOrderControllers.createRentalOrder,
);

// Get user's rental orders
router.get("/all-orders", auth(), RentalOrderControllers.getUserRentalOrders);

// Get rental order details by ID
router.get(
  "/:id",
  auth(),
  validateRequest(RentalOrderValidations.getRentalOrderByIdValidationSchema),
  RentalOrderControllers.getRentalOrderDetails,
);

export const rentalOrderRoutes = router;
