export interface ICreateRentalOrderPayload {
  gearItemId: string;
  startDate: string | Date;
  endDate: string | Date;
  totalPrice: number;
  quantity: number;
}
