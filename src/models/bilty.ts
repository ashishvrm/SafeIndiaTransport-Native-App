export type BiltyStatus =
  | 'created'
  | 'loaded'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type PaymentType = 'to_pay' | 'paid' | 'to_be_billed';

export interface BiltyStatusHistoryItem {
  status: BiltyStatus;
  note?: string;
  location?: string;
  changedAt: number; // timestamp
}

export interface Bilty {
  id: string;
  biltyNumber: string;
  date: number;

  consignorId: string;
  consigneeId: string;

  origin: string;
  destination: string;

  vehicleId?: string;
  driverId?: string;

  goodsDescription: string;
  noOfPackages: number;
  totalWeightKg: number;

  freightAmount: number;
  otherCharges?: number;
  gstAmount?: number;
  totalAmount: number;
  paymentType: PaymentType;

  status: BiltyStatus;
  statusHistory: BiltyStatusHistoryItem[];

  createdBy: string;
  createdAt: number;
  updatedAt: number;
  attachments?: string[];
}
