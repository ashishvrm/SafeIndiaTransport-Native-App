export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  companyName?: string;
  gstin?: string;
  isActive: boolean;
  createdAt: number; // timestamp (ms)
}
