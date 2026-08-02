import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// View incoming rental orders belonging to the provider's gears
const getProviderIncomingOrdersFromDB = async (providerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: {
      gearItem: {
        providerId: providerId,
      },
    },
    include: {
      gearItem: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};


/**
 * Update incoming rental order status with strict business rules
 */
const updateProviderOrderStatusInDB = async (
  orderId: string,
  providerId: string,
  status: OrderStatus,
) => {
  // 1. Fetch the order and verify the provider owns the associated gear item
  const existingOrder = await prisma.rentalOrder.findFirst({
    where: {
      id: orderId,
      gearItem: {
        providerId: providerId,
      },
    },
  });

  if (!existingOrder) {
    throw new Error(
      'No associated or authorized rental order found under your gear profile!',
    );
  }

  // 2. Simple Check: Provider can only update status if payment status is PAID
  if (existingOrder.paymentStatus !== PaymentStatus.PAID) {
    throw new Error(
      'You cannot update the status of this order until the customer completes the payment!',
    );
  }


  // 4. Update order status in the database directly
  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status },
  });

  return updatedOrder;
};


export const ProviderOrderServices = {
  getProviderIncomingOrdersFromDB,
  updateProviderOrderStatusInDB,
};
