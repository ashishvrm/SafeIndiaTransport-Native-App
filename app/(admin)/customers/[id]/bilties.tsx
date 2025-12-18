// app/(admin)/customers/[id]/bilties.tsx

import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Checkbox,
    Modal,
    Portal,
    Text,
} from 'react-native-paper';

import {
    // if your repo uses a slightly different name, replace here
    fetchBiltiesForConsignee,
} from '../../../../src/data/biltiesRepository';
import { fetchPartyById } from '../../../../src/data/partiesRepository';
import type { Bilty } from '../../../../src/models/bilty';
import type { Party } from '../../../../src/models/party';
import { colors } from '../../../../src/theme/colors';

// ---------- Bill HTML builder (multi-bilty customer invoice) ----------

function buildCustomerBillHtml(customer: Party, bilties: Bilty[]) {
  const customerName = customer.name ?? 'Customer';
  const customerAddr = [
    customer.addressLine1,
    customer.addressLine2,
    customer.city && customer.state
      ? `${customer.city}, ${customer.state}`
      : undefined,
  ]
    .filter(Boolean)
    .join('<br />');

  const totalAmount = bilties.reduce(
    (sum, b) => sum + (b.totalAmount ?? 0),
    0,
  );

  const rowsHtml = bilties
    .map((b, index) => {
      const dateStr = b.createdAt
        ? new Date(b.createdAt).toLocaleDateString()
        : '';
      const place = b.destination || '-';
      const weight = b.totalWeightKg ?? 0;
      const amount = b.totalAmount ?? 0;

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${b.vehicleId || '-'}</td>
          <td>${b.biltyNumber}</td>
          <td>${dateStr}</td>
          <td>${place}</td>
          <td class="right">${weight}</td>
          <td class="right">₹${amount}</td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bill – ${customerName}</title>
    <style>
      * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      body { margin: 0; padding: 16px; background: #ffffff; }
      .sheet { border: 2px solid #222; padding: 16px; }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #222;
        padding-bottom: 8px;
        margin-bottom: 12px;
      }
      .brand {
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #104f8b;
      }
      .subtitle { font-size: 11px; color: #444; }
      .section-title {
        font-size: 13px;
        font-weight: 700;
        margin: 12px 0 4px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 2px;
      }
      .row { display: flex; flex-direction: row; justify-content: space-between; font-size: 11px; }
      .col { flex: 1; padding: 4px 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
      th, td { border: 1px solid #aaa; padding: 4px 6px; text-align: left; }
      th { background: #f3eef7; }
      .right { text-align: right; }
      .mt-sm { margin-top: 4px; }
      .mt-md { margin-top: 8px; }
      .totals-row th { font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <div>
          <div class="brand">SAFE INDIA TRANSPORT</div>
          <div class="subtitle">Fleet Owners & Transport Contractors</div>
          <div class="subtitle">#1235, VPO Kharawar, Rohtak-124021 (Haryana)</div>
        </div>
        <div style="text-align:right;font-size:11px;">
          <div>GSTIN: 06CWNP59342C1Z6</div>
          <div class="mt-sm">Mob.: 8059xxxx44 / 8059xxxx05</div>
          <div>Email: safeindiatransport@gmail.com</div>
          <div class="mt-sm">Date: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div class="section-title">Billed To</div>
      <div class="row">
        <div class="col">
          <div><strong>${customerName}</strong></div>
          <div>${customerAddr || ''}</div>
          <div class="mt-sm">GSTIN: ${customer.gstin || '-'}</div>
        </div>
      </div>

      <div class="section-title">Bilties</div>
      <table>
        <thead>
          <tr>
            <th style="width:5%;">Sr.</th>
            <th style="width:15%;">Vehicle No.</th>
            <th style="width:15%;">Bilty No.</th>
            <th style="width:15%;">Bilty Date</th>
            <th>Place</th>
            <th style="width:12%;" class="right">Weight</th>
            <th style="width:18%;" class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="totals-row">
            <th colspan="6">Grand Total</th>
            <th class="right">₹${totalAmount}</th>
          </tr>
        </tbody>
      </table>

      <div class="row mt-md">
        <div class="col">
          <div style="font-size:10px;color:#555;">
            TERMS & CONDITIONS: All disputes are subject to Rohtak jurisdiction only.
            No responsibility for leakage, breakage & damage. Consignee is responsible
            for legal goods and tax/VAT matters.
          </div>
        </div>
        <div class="col" style="text-align:right;">
          <div class="mt-md" style="font-size:11px;">For SAFE INDIA TRANSPORT</div>
          <div style="height:30px;"></div>
          <div style="font-size:11px;">Authorised Signatory</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

// ------------------------ Screen component ------------------------

export default function CustomerBiltiesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [customer, setCustomer] = useState<Party | null>(null);
  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bill modal state
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [billModalLoading, setBillModalLoading] = useState(false);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);

  // Load customer + bilties
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const [party, customerBilties] = await Promise.all([
          fetchPartyById(String(id)),
          fetchBiltiesForConsignee(String(id)), // adjust if your function name differs
        ]);

        setCustomer(party);
        setBilties(customerBilties);
      } catch (e: any) {
        console.error('[CustomerBilties] load error', e);
        setError(e?.message || 'Failed to load customer bilties');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // -------- Bill modal helpers --------

  const openBillModal = () => {
    if (!bilties.length) {
      Alert.alert(
        'No bilties',
        'There are no bilties for this customer to include in a bill.',
      );
      return;
    }
    setSelectedBillIds(bilties.map((b) => b.id));
    setBillModalVisible(true);
  };

  const toggleBillSelection = (biltyId: string) => {
    setSelectedBillIds((prev) =>
      prev.includes(biltyId)
        ? prev.filter((id) => id !== biltyId)
        : [...prev, biltyId],
    );
  };

  const handleGenerateSelectedBill = async () => {
    if (!customer) return;

    const selected = bilties.filter((b) => selectedBillIds.includes(b.id));
    if (!selected.length) {
      Alert.alert('Nothing selected', 'Please select at least one bilty.');
      return;
    }

    try {
      setBillModalLoading(true);
      const html = buildCustomerBillHtml(customer, selected);
      const { uri } = await Print.printToFileAsync({ html });

      Alert.alert('Bill generated', 'What would you like to do with the PDF?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: async () => {
            try {
              const canShare = await Sharing.isAvailableAsync();
              if (canShare) {
                await Sharing.shareAsync(uri, {
                  mimeType: 'application/pdf',
                  dialogTitle: `Share bill – ${customer.name}`,
                });
              } else {
                Alert.alert('PDF saved', uri);
              }
            } catch (err) {
              console.error('[CustomerBilties] share bill error', err);
              Alert.alert('Error', 'Failed to share PDF.');
            }
          },
        },
        {
          text: 'Print',
          onPress: async () => {
            try {
              await Print.printAsync({ uri });
            } catch (err) {
              console.error('[CustomerBilties] print bill error', err);
              Alert.alert('Error', 'Failed to open printer dialog.');
            }
          },
        },
      ]);

      setBillModalVisible(false);
    } catch (e) {
      console.error('[CustomerBilties] generate bill error', e);
      Alert.alert('Error', 'Failed to generate bill PDF. Please try again.');
    } finally {
      setBillModalLoading(false);
    }
  };

  // -------- Render helpers --------

  const handleNewBilty = () => {
    if (!id) return;
    // Navigate to new bilty form with consignee pre-filled
    router.push({
      pathname: '/(admin)/bilties/new',
      params: { consigneeId: String(id) },
    });
  };

  const handleOpenBilty = (biltyId: string) => {
    router.push(`/(admin)/bilties/${biltyId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.infoText}>Loading customer bilties…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !customer) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={[styles.infoText, { color: colors.danger }]}>
            {error || 'Customer not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header card with New Bilty + View Bill buttons */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text style={styles.customerName}>{customer.name}</Text>
            {(customer.city || customer.state) && (
              <Text style={styles.customerSubtitle}>
                {customer.city}
                {customer.city && customer.state ? ', ' : ''}
                {customer.state}
              </Text>
            )}
            {customer.gstin && (
              <Text style={styles.customerSubtitle}>
                GSTIN: {customer.gstin}
              </Text>
            )}

            <View style={styles.headerActions}>
              <Button
                mode="contained"
                onPress={handleNewBilty}
                style={styles.headerButton}
              >
                Create New Bilty
              </Button>
              <Button
                mode="outlined"
                onPress={openBillModal}
                style={styles.headerButton}
              >
                View Bill
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* List of bilties */}
        {bilties.map((b) => (
          <TouchableOpacity
            key={b.id}
            activeOpacity={0.85}
            onPress={() => handleOpenBilty(b.id)}
          >
            <Card style={styles.biltyCard}>
              <Card.Content style={styles.biltyCardContent}>
                <View style={styles.biltyIconCircle}>
                  <Text style={styles.biltyIcon}>🚚</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.biltyNumber}>{b.biltyNumber}</Text>
                  <Text style={styles.biltySubtitle}>
                    {b.origin} → {b.destination} • ₹{b.totalAmount} •{' '}
                    {b.status.replace('_', ' ')}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}

        {bilties.length === 0 && (
          <Text style={styles.infoText}>No bilties for this customer yet.</Text>
        )}
      </ScrollView>

      {/* Bill selection modal */}
      <Portal>
        <Modal
          visible={billModalVisible}
          onDismiss={() => setBillModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Generate Bill</Text>
          <Text style={styles.modalSubtitle}>
            Select the bilties you want to include in this bill.
          </Text>

          <ScrollView
            style={{ maxHeight: 300 }}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            {bilties.map((b) => {
              const checked = selectedBillIds.includes(b.id);
              return (
                <TouchableOpacity
                  key={b.id}
                  style={styles.modalRow}
                  onPress={() => toggleBillSelection(b.id)}
                  activeOpacity={0.8}
                >
                  <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={() => toggleBillSelection(b.id)}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalBiltyNumber}>{b.biltyNumber}</Text>
                    <Text style={styles.modalBiltySubtitle}>
                      {b.origin} → {b.destination} • ₹{b.totalAmount} •{' '}
                      {b.status.replace('_', ' ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalButtonsRow}>
            <Button
              mode="text"
              onPress={() => setBillModalVisible(false)}
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleGenerateSelectedBill}
              style={{ flex: 1, marginLeft: 8 }}
              disabled={billModalLoading}
            >
              {billModalLoading ? 'Generating…' : 'Generate Bill'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  infoText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSubtle,
  },
  headerCard: {
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    marginBottom: 16,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMain,
  },
  customerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSubtle,
  },
  headerActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  headerButton: {
    flex: 1,
    marginRight: 8,
  },
  biltyCard: {
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
    marginBottom: 10,
  },
  biltyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biltyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fde68a',
  },
  biltyIcon: {
    fontSize: 20,
  },
  biltyNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  biltySubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSubtle,
  },
  modalContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSubtle,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  modalBiltyNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  modalBiltySubtitle: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
});
