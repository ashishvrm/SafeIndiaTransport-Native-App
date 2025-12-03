import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';
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
