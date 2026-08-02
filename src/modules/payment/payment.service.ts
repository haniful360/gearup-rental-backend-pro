import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import {
  ICreatePaymentIntentPayload,
  IConfirmPaymentPayload,
} from "./payment.interface";
import config from "../../config";
import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";

// Initialize stripe
const stripe = new Stripe(config.stripe_secret_key as string);

const createPaymentIntentInDB = async (
  customerId: string,
  payload: ICreatePaymentIntentPayload,
) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: payload.rentalOrderId },
    include: { gearItem: true },
  });

  if (!rentalOrder) {
    throw new Error("Rental order not found!");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new Error("You are not authorized to pay for this rental order!");
  }

  if (rentalOrder.paymentStatus === PaymentStatus.PAID) {
    throw new Error("This rental order has already been paid for!");
  }

  // Generate Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${config.stripe_success_url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: config.stripe_cancel_url,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: rentalOrder.gearItem.title,
          },
          unit_amount: Math.round(
            (rentalOrder.totalPrice / rentalOrder.quantity) * 100,
          ),
        },
        quantity: rentalOrder.quantity,
      },
    ],
  });

  // Temporarily attach session.id to rentalOrder for tracking before webhook/callback confirmation
  await prisma.rentalOrder.update({
    where: { id: rentalOrder.id },
    data: { transactionId: session.id },
  });

  return {
    paymentUrl: session.url,
    sessionId: session.id,
  };
};

// Confirm and verify payment status, then update order state and deduct inventory stock
const confirmPaymentInDB = async (payload: IConfirmPaymentPayload) => {
  const { sessionId } = payload;

  // Retrieve session details directly from stripe to verify authenticity
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    const result = await prisma.$transaction(async (tx) => {
      // Find the rental order using transactionId along with its associated gear item details
      const rentalOrder = await tx.rentalOrder.findUnique({
        where: { transactionId: sessionId },
        include: { gearItem: true },
      });

      if (!rentalOrder) {
        throw new Error("No associated rental order found for this payment session!");
      }

      // Safeguard: If already marked as PAID due to webhook concurrency, skip duplicate execution
      if (rentalOrder.paymentStatus === PaymentStatus.PAID) {
        return { message: "Payment already processed previously." };
      }

      // Final real-time validation: Ensure items are still available in inventory stock before completing payment adjustments
      if (rentalOrder.gearItem.stock < rentalOrder.quantity || !rentalOrder.gearItem.isAvailable) {
        throw new Error("Inventory depleted! The item went out of stock right before payment confirmation.");
      }

      // Calculate the remaining inventory assets volume
      const newStock = rentalOrder.gearItem.stock - rentalOrder.quantity;

      // Update the gear item stock records and availability boolean safely inside transaction scope
      await tx.gearItem.update({
        where: { id: rentalOrder.gearItemId },
        data: {
          stock: newStock,
          isAvailable: newStock > 0,
        },
      });

      // Update rental order statuses: paymentStatus shifts to PAID, and status transitions to OrderStatus.PAID
      const updatedOrder = await tx.rentalOrder.update({
        where: { id: rentalOrder.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.PAID,
        },
      });

      // Create a persistent transaction log entry inside payment collection model mapping values
      const paymentRecord = await tx.payment.create({
        data: {
          rentalOrderId: rentalOrder.id,
          amount: rentalOrder.totalPrice,
          transactionId: sessionId,
          method: "CARD",
          provider: "STRIPE",
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      return { paymentRecord, updatedOrder };
    });

    return result;
  } else {
    throw new Error("Payment was not completed successfully on Stripe!");
  }
};

// Get user's payment history
const getUserPaymentHistoryFromDB = async (customerId: string) => {
  const result = await prisma.payment.findMany({
    where: {
      rentalOrder: {
        customerId: customerId,
      },
    },
    include: {
      rentalOrder: {
        include: {
          gearItem: true
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

// Get specific payment details
const getPaymentDetailsFromDB = async (
  paymentId: string,
  customerId: string,
) => {
  const result = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      rentalOrder: {
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
          gearItem: true,
        },
      },
    },
  });

  if (!result) {
    throw new Error("Payment records not found!");
  }

  if (result.rentalOrder.customerId !== customerId) {
    throw new Error("Unauthorized access to this payment profile");
  }

  return result;
};

export const PaymentServices = {
  createPaymentIntentInDB,
  confirmPaymentInDB,
  getUserPaymentHistoryFromDB,
  getPaymentDetailsFromDB,
};
