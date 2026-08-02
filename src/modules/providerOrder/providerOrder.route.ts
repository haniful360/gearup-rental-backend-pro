import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProviderOrderControllers } from "./providerOrder.controller";
// import { ProviderOrderValidations } from "./providerOrder.validation";
import { Role } from "../../../generated/prisma/enums";
import { ProviderOrderValidations } from "./providerOrder.validation";

const router = Router();

// 1. incoming orders for provider
router.get(
  "/orders",
  auth(Role.PROVIDER),
  ProviderOrderControllers.getProviderIncomingOrders,
);

// Update specific order status
router.patch(
  "/orders-status/:id",
  auth(Role.PROVIDER),
  validateRequest(ProviderOrderValidations.updateProviderOrderStatusValidationSchema),
  ProviderOrderControllers.updateProviderOrderStatus,
);

// Provider dashboard overview
router.get("/overview", auth(Role.PROVIDER), ProviderOrderControllers.getProviderOverview);

// Provider recent orders
router.get(
  "/recent-orders",
  auth(Role.PROVIDER),
  validateRequest(ProviderOrderValidations.getRecentQuerySchema),
  ProviderOrderControllers.getProviderRecentOrders,
);

// Provider top rented gears
router.get(
  "/top-gears",
  auth(Role.PROVIDER),
  validateRequest(ProviderOrderValidations.getRecentQuerySchema),
  ProviderOrderControllers.getProviderTopGears,
);

// Provider low stock gear alerts
router.get(
  "/low-stock-gears",
  auth(Role.PROVIDER),
  validateRequest(ProviderOrderValidations.getLowStockQuerySchema),
  ProviderOrderControllers.getProviderLowStockGears,
);

export const providerOrderRoutes = router;
