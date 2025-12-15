import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
  setDoc,
  addDoc,
  where,
  updateDoc,
  deleteDoc, 
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Bilty, BiltyStatus, BiltyStatusHistoryItem, PaymentType } from '../models/bilty';

export interface NewBiltyInput {
  consignorId: string;
  consigneeId: string;
  origin: string;
  destination: string;
  goodsDescription: string;
  noOfPackages: number;
  totalWeightKg: number;
  freightAmount: number;
  otherCharges?: number;
  gstAmount?: number;
  paymentType: PaymentType;
  vehicleId?: string;
  driverId?: string;
  createdBy: string;
}
export interface EditableBiltyFields {
  consignorId: string;
  consigneeId: string;
  origin: string;
  destination: string;
  goodsDescription: string;
  noOfPackages: number;
  totalWeightKg: number;
  freightAmount: number;
  otherCharges?: number;
  gstAmount?: number;
  paymentType: PaymentType;
  vehicleId?: string;
  driverId?: string;
  status: BiltyStatus;
}

function normalizeNumber(value: any, fallback = 0): number {
  if (typeof value === 'number') return value;
  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  return fallback;
}

function normalizeString(value: any, fallback = ''): string {
  if (typeof value === 'string') return value;
  return fallback;
}

function normalizeStatusHistory(value: any): BiltyStatusHistoryItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    status: normalizeString(item?.status) as BiltyStatus,
    note: item?.note ? String(item.note) : undefined,
    location: item?.location ? String(item.location) : undefined,
    changedAt: normalizeNumber(item?.changedAt, Date.now()),
  }));
}

export async function fetchAllBilties(): Promise<Bilty[]> {
  const ref = collection(db, 'bilties');
  const q = query(ref, orderBy('date', 'desc'));

  const snapshot = await getDocs(q);

  const result: Bilty[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      biltyNumber: normalizeString(data.biltyNumber),
      date: normalizeNumber(data.date, Date.now()),

      consignorId: normalizeString(data.consignorId),
      consigneeId: normalizeString(data.consigneeId),

      origin: normalizeString(data.origin),
      destination: normalizeString(data.destination),

      vehicleId: data.vehicleId ? String(data.vehicleId) : undefined,
      driverId: data.driverId ? String(data.driverId) : undefined,

      goodsDescription: normalizeString(data.goodsDescription),
      noOfPackages: normalizeNumber(data.noOfPackages, 0),
      totalWeightKg: normalizeNumber(data.totalWeightKg, 0),

      freightAmount: normalizeNumber(data.freightAmount, 0),
      otherCharges: data.otherCharges != null ? normalizeNumber(data.otherCharges, 0) : undefined,
      gstAmount: data.gstAmount != null ? normalizeNumber(data.gstAmount, 0) : undefined,
      totalAmount: normalizeNumber(data.totalAmount, 0),
      paymentType: normalizeString(data.paymentType) as PaymentType,

      status: normalizeString(data.status) as any,
      statusHistory: normalizeStatusHistory(data.statusHistory),

      createdBy: normalizeString(data.createdBy),
      createdAt: normalizeNumber(data.createdAt, Date.now()),
      updatedAt: normalizeNumber(data.updatedAt, Date.now()),
      attachments: Array.isArray(data.attachments)
        ? data.attachments.map((x: any) => String(x))
        : [],
    };
  });

  return result;
}
export async function fetchBiltyById(id: string): Promise<Bilty | null> {
  const ref = doc(db, 'bilties', id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();

  return {
    id: snap.id,
    biltyNumber: normalizeString(data.biltyNumber),
    date: normalizeNumber(data.date, Date.now()),

    consignorId: normalizeString(data.consignorId),
    consigneeId: normalizeString(data.consigneeId),

    origin: normalizeString(data.origin),
    destination: normalizeString(data.destination),

    vehicleId: data.vehicleId ? String(data.vehicleId) : undefined,
    driverId: data.driverId ? String(data.driverId) : undefined,

    goodsDescription: normalizeString(data.goodsDescription),
    noOfPackages: normalizeNumber(data.noOfPackages, 0),
    totalWeightKg: normalizeNumber(data.totalWeightKg, 0),

    freightAmount: normalizeNumber(data.freightAmount, 0),
    otherCharges: data.otherCharges != null ? normalizeNumber(data.otherCharges, 0) : undefined,
    gstAmount: data.gstAmount != null ? normalizeNumber(data.gstAmount, 0) : undefined,
    totalAmount: normalizeNumber(data.totalAmount, 0),
    paymentType: normalizeString(data.paymentType) as PaymentType,

    status: normalizeString(data.status) as any,
    statusHistory: normalizeStatusHistory(data.statusHistory),

    createdBy: normalizeString(data.createdBy),
    createdAt: normalizeNumber(data.createdAt, Date.now()),
    updatedAt: normalizeNumber(data.updatedAt, Date.now()),
    attachments: Array.isArray(data.attachments)
      ? data.attachments.map((x: any) => String(x))
      : [],
  };
}
export async function createBilty(input: NewBiltyInput): Promise<string> {
  const now = Date.now();

  const biltyNumber = `BLTY-${now}`; // simple client-side bilty number for now

  const ref = collection(db, 'bilties');

  const docRef = await addDoc(ref, {
    biltyNumber,
    date: now,

    consignorId: input.consignorId,
    consigneeId: input.consigneeId,

    origin: input.origin,
    destination: input.destination,

    vehicleId: input.vehicleId ?? null,
    driverId: input.driverId ?? null,

    goodsDescription: input.goodsDescription,
    noOfPackages: input.noOfPackages,
    totalWeightKg: input.totalWeightKg,

    freightAmount: input.freightAmount,
    otherCharges: input.otherCharges ?? 0,
    gstAmount: input.gstAmount ?? 0,
    totalAmount:
      input.freightAmount + (input.otherCharges ?? 0) + (input.gstAmount ?? 0),
    paymentType: input.paymentType,

    status: 'created',
    statusHistory: [
      {
        status: 'created',
        note: 'Bilty created from mobile app',
        changedAt: now,
      },
    ],

    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    attachments: [],
  });

  return docRef.id;
}
export async function fetchBiltiesForConsignee(consigneeId: string): Promise<Bilty[]> {
  const ref = collection(db, 'bilties');
  const q = query(ref, where('consigneeId', '==', consigneeId), orderBy('date', 'desc'));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      biltyNumber: normalizeString(data.biltyNumber),
      date: normalizeNumber(data.date, Date.now()),

      consignorId: normalizeString(data.consignorId),
      consigneeId: normalizeString(data.consigneeId),

      origin: normalizeString(data.origin),
      destination: normalizeString(data.destination),

      vehicleId: data.vehicleId ? String(data.vehicleId) : undefined,
      driverId: data.driverId ? String(data.driverId) : undefined,

      goodsDescription: normalizeString(data.goodsDescription),
      noOfPackages: normalizeNumber(data.noOfPackages, 0),
      totalWeightKg: normalizeNumber(data.totalWeightKg, 0),

      freightAmount: normalizeNumber(data.freightAmount, 0),
      otherCharges:
        data.otherCharges != null ? normalizeNumber(data.otherCharges, 0) : undefined,
      gstAmount:
        data.gstAmount != null ? normalizeNumber(data.gstAmount, 0) : undefined,
      totalAmount: normalizeNumber(data.totalAmount, 0),
      paymentType: normalizeString(data.paymentType) as PaymentType,

      status: normalizeString(data.status) as any,
      statusHistory: normalizeStatusHistory(data.statusHistory),

      createdBy: normalizeString(data.createdBy),
      createdAt: normalizeNumber(data.createdAt, Date.now()),
      updatedAt: normalizeNumber(data.updatedAt, Date.now()),
      attachments: Array.isArray(data.attachments)
        ? data.attachments.map((x: any) => String(x))
        : [],
    };
  });
}
export async function updateBilty(
  id: string,
  fields: EditableBiltyFields,
): Promise<void> {
  const ref = doc(db, 'bilties', id);
  const now = Date.now();

  const totalAmount =
    fields.freightAmount +
    (fields.otherCharges ?? 0) +
    (fields.gstAmount ?? 0);

  await updateDoc(ref, {
    consignorId: fields.consignorId,
    consigneeId: fields.consigneeId,
    origin: fields.origin,
    destination: fields.destination,
    goodsDescription: fields.goodsDescription,
    noOfPackages: fields.noOfPackages,
    totalWeightKg: fields.totalWeightKg,

    freightAmount: fields.freightAmount,
    otherCharges: fields.otherCharges ?? 0,
    gstAmount: fields.gstAmount ?? 0,
    totalAmount,

    paymentType: fields.paymentType,
    vehicleId: fields.vehicleId ?? null,
    driverId: fields.driverId ?? null,

    status: fields.status,
    updatedAt: now,
    // statusHistory: keep as-is for now, we’re not touching it here
  });
}
export async function deleteBilty(id: string): Promise<void> {
  const ref = doc(db, 'bilties', id);
  await deleteDoc(ref);
}
// Create or reuse a public share id for this bilty and return a URL
export async function ensureBiltyPublicLink(
  biltyId: string,
): Promise<{ publicId: string; url: string }> {
  const biltyRef = doc(db, 'bilties', biltyId);
  const biltySnap = await getDoc(biltyRef);

  if (!biltySnap.exists()) {
    throw new Error('Bilty not found');
  }

  const data = biltySnap.data() as Bilty & { publicShareId?: string };
  let publicId = data.publicShareId;

  if (!publicId) {
    // create a mapping doc in `biltyPublicLinks` and store the id back on the bilty
    const linkRef = doc(collection(db, 'biltyPublicLinks'));
    publicId = linkRef.id;

    await Promise.all([
      updateDoc(biltyRef, { publicShareId: publicId }),
      setDoc(linkRef, {
        biltyId,
        createdAt: serverTimestamp(),
      }),
    ]);
  }

  // TODO: change this to your real hosted web URL later
  const PUBLIC_BASE_URL = 'https://safeindiatransport-status.web.app';
  const url = `${PUBLIC_BASE_URL}/public/bilty/${publicId}`;

  return { publicId, url };
}
export async function fetchBiltyByPublicId(
  publicId: string,
): Promise<Bilty | null> {
  const linkRef = doc(db, 'biltyPublicLinks', publicId);
  const linkSnap = await getDoc(linkRef);

  if (!linkSnap.exists()) return null;

  const { biltyId } = linkSnap.data() as { biltyId: string };
  // you already have this function in this file
  return fetchBiltyById(biltyId);
}
