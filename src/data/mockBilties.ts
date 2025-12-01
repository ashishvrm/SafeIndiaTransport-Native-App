import { Bilty } from '../models/bilty';

export const MOCK_BILTIES: Bilty[] = [
  {
    id: 'bilty-001',
    biltyNumber: 'BLTY-001',
    date: Date.now() - 1000 * 60 * 60 * 24, // yesterday

    consignorId: 'party-01',
    consigneeId: 'party-02',

    origin: 'Delhi',
    destination: 'Mumbai',

    vehicleId: 'veh-001',
    driverId: 'drv-001',

    goodsDescription: 'Industrial spare parts',
    noOfPackages: 100,
    totalWeightKg: 1200,

    freightAmount: 15000,
    otherCharges: 500,
    gstAmount: 2800,
    totalAmount: 18300,
    paymentType: 'to_pay',

    status: 'in_transit',
    statusHistory: [
      {
        status: 'created',
        note: 'Bilty created at Delhi office',
        changedAt: Date.now() - 1000 * 60 * 60 * 26,
      },
      {
        status: 'loaded',
        note: 'Loaded at Delhi warehouse',
        changedAt: Date.now() - 1000 * 60 * 60 * 24,
      },
      {
        status: 'in_transit',
        note: 'Departed from Delhi',
        changedAt: Date.now() - 1000 * 60 * 60 * 20,
      },
    ],

    createdBy: 'user-admin-1',
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    updatedAt: Date.now() - 1000 * 60 * 60 * 20,
    attachments: [],
  },
  {
    id: 'bilty-002',
    biltyNumber: 'BLTY-002',
    date: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago

    consignorId: 'party-03',
    consigneeId: 'party-04',

    origin: 'Indore',
    destination: 'Pune',

    vehicleId: 'veh-002',
    driverId: 'drv-002',

    goodsDescription: 'FMCG cartons',
    noOfPackages: 50,
    totalWeightKg: 800,

    freightAmount: 9000,
    otherCharges: 0,
    gstAmount: 1620,
    totalAmount: 10620,
    paymentType: 'paid',

    status: 'delivered',
    statusHistory: [
      {
        status: 'created',
        changedAt: Date.now() - 1000 * 60 * 60 * 52,
      },
      {
        status: 'loaded',
        changedAt: Date.now() - 1000 * 60 * 60 * 50,
      },
      {
        status: 'in_transit',
        changedAt: Date.now() - 1000 * 60 * 60 * 46,
      },
      {
        status: 'delivered',
        note: 'Delivered at Pune hub',
        changedAt: Date.now() - 1000 * 60 * 60 * 40,
      },
    ],

    createdBy: 'user-admin-1',
    createdAt: Date.now() - 1000 * 60 * 60 * 52,
    updatedAt: Date.now() - 1000 * 60 * 60 * 40,
    attachments: [],
  },
];
