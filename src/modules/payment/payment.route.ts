import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";
import { PaymentValidations } from "./payment.validation";
import { PaymentControllers } from "./payment.controller";


const router = Router();

// Initialize stripe checkout links
router.post(
  "/create",
  auth(),
  validateRequest(PaymentValidations.createPaymentIntentValidationSchema),
  PaymentControllers.createPaymentIntent,
);

// Complete verification 
router.post(
  "/confirm",
  auth(),
  validateRequest(PaymentValidations.confirmPaymentValidationSchema),
  PaymentControllers.confirmPayment,
);

// GET: Show all past transactions for a user
router.get("/history", auth(), PaymentControllers.getUserPaymentHistory);

// Get details of a specific transaction
router.get("/:id", auth(), PaymentControllers.getPaymentDetails);

export const paymentRoutes = router;
