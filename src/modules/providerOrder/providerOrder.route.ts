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

export const providerOrderRoutes = router;
