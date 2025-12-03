import { collection, getDocs, orderBy, query, doc, getDoc, addDoc, } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Party } from '../models/party';

function normalizeString(value: any, fallback = ''): string {
  if (typeof value === 'string') return value;
  return fallback;
}

function normalizeNumber(value: any, fallback = 0): number {
  if (typeof value === 'number') return value;
  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  return fallback;
}

function normalizeBool(value: any, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

export async function fetchAllParties(): Promise<Party[]> {
  const ref = collection(db, 'parties');
  const q = query(ref, orderBy('name'));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      name: normalizeString(data.name),
      contactPerson: data.contactPerson ? String(data.contactPerson) : undefined,
      phone: data.phone ? String(data.phone) : undefined,
      email: data.email ? String(data.email) : undefined,
      gstin: data.gstin ? String(data.gstin) : undefined,
      addressLine1: data.addressLine1 ? String(data.addressLine1) : undefined,
      addressLine2: data.addressLine2 ? String(data.addressLine2) : undefined,
      city: data.city ? String(data.city) : undefined,
      state: data.state ? String(data.state) : undefined,
      pincode: data.pincode ? String(data.pincode) : undefined,
      type: (data.type as any) ?? 'both',
      isActive: normalizeBool(data.isActive, true),
      createdAt: normalizeNumber(data.createdAt, Date.now()),
      updatedAt: normalizeNumber(data.updatedAt, Date.now()),
    };
  });
}
export async function fetchPartyById(id: string): Promise<Party | null> {
  const ref = doc(db, 'parties', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data();

  return {
    id: snap.id,
    name: normalizeString(data.name),
    contactPerson: data.contactPerson ? String(data.contactPerson) : undefined,
    phone: data.phone ? String(data.phone) : undefined,
    email: data.email ? String(data.email) : undefined,
    gstin: data.gstin ? String(data.gstin) : undefined,
    addressLine1: data.addressLine1 ? String(data.addressLine1) : undefined,
    addressLine2: data.addressLine2 ? String(data.addressLine2) : undefined,
    city: data.city ? String(data.city) : undefined,
    state: data.state ? String(data.state) : undefined,
    pincode: data.pincode ? String(data.pincode) : undefined,
    type: (data.type as any) ?? 'both',
    isActive: normalizeBool(data.isActive, true),
    createdAt: normalizeNumber(data.createdAt, Date.now()),
    updatedAt: normalizeNumber(data.updatedAt, Date.now()),
  };
}
export interface NewCustomerInput {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  // in future we can add type here if needed
}
export async function createCustomerAccount(input: NewCustomerInput): Promise<string> {
  const now = Date.now();

  const ref = collection(db, 'parties');

  const docRef = await addDoc(ref, {
    name: input.name.trim(),
    contactPerson: input.contactPerson?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    gstin: input.gstin?.trim() || null,
    addressLine1: input.addressLine1?.trim() || null,
    addressLine2: input.addressLine2?.trim() || null,
    city: input.city?.trim() || null,
    state: input.state?.trim() || null,
    pincode: input.pincode?.trim() || null,
    type: 'consignee', // treat customer accounts as consignees
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}
export async function fetchCustomerParties(): Promise<Party[]> {
  const all = await fetchAllParties();
  return all.filter((p) => p.type === 'consignee' || p.type === 'both');
}
