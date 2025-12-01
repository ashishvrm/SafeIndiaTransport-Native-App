export type UserRole = 'admin' | 'customer';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}
