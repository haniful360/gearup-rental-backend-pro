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

// Customer dashboard overview
router.get("/overview", auth(), RentalOrderControllers.getCustomerOverview);

// Customer recent orders
router.get(
  "/recent-orders",
  auth(),
  validateRequest(RentalOrderValidations.getRecentQuerySchema),
  RentalOrderControllers.getCustomerRecentOrders,
);

// Customer recent reviews
router.get(
  "/recent-reviews",
  auth(),
  validateRequest(RentalOrderValidations.getRecentQuerySchema),
  RentalOrderControllers.getCustomerRecentReviews,
);

// Get rental order details by ID
router.get(
  "/:id",
  auth(),
  validateRequest(RentalOrderValidations.getRentalOrderByIdValidationSchema),
  RentalOrderControllers.getRentalOrderDetails,
);

export const rentalOrderRoutes = router;
