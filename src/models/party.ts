export type PartyType = 'consignor' | 'consignee' | 'both';

export interface Party {
  id: string;              // Firestore doc id
  name: string;            // Display name (company/person)
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  type: PartyType;         // consignor / consignee / both
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
