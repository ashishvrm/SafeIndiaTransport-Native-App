// app/(admin)/bilties/[id].tsx

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Text,
} from 'react-native-paper';

import {
    deleteBilty,
    ensureBiltyPublicLink,
    fetchBiltyById,
} from '../../../src/data/biltiesRepository';
import { fetchPartyById } from '../../../src/data/partiesRepository';
import type { Bilty } from '../../../src/models/bilty';
import type { Party } from '../../../src/models/party';
import { colors } from '../../../src/theme/colors';

const STATUS_STEPS = [
  { key: 'created', label: 'Created' },
  { key: 'loaded', label: 'Loaded' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

// Build printable HTML for the bilty PDF
function buildBiltyHtml(
  bilty: Bilty,
  consignor?: Party | null,
  consignee?: Party | null,
) {
  const consignorName = consignor?.name ?? bilty.consignorId;
  const consigneeName = consignee?.name ?? bilty.consigneeId;

  const consignorAddr = [
    consignor?.addressLine1,
    consignor?.addressLine2,
    consignor?.city && consignor?.state
      ? `${consignor.city}, ${consignor.state}`
      : undefined,
  ]
    .filter(Boolean)
    .join('<br />');

  const consigneeAddr = [
    consignee?.addressLine1,
    consignee?.addressLine2,
    consignee?.city && consignee?.state
      ? `${consignee.city}, ${consignee.state}`
      : undefined,
  ]
    .filter(Boolean)
    .join('<br />');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bilty ${bilty.biltyNumber}</title>
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
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <div>
          <div class="brand">SAFE INDIA TRANSPORT</div>
          <div class="subtitle">Fleet Owners & Transport Contractors</div>
        </div>
        <div style="text-align:right;font-size:11px;">
          <div>GSTIN: 06CWNP59342C1Z6</div>
          <div class="mt-sm">Bilty No: <strong>${bilty.biltyNumber}</strong></div>
          <div>Route: ${bilty.origin} → ${bilty.destination}</div>
          <div class="mt-sm">Date: ${
            bilty.createdAt
              ? new Date(bilty.createdAt).toLocaleDateString()
              : ''
          }</div>
        </div>
      </div>

      <div class="row">
        <div class="col" style="border-right:1px solid #ddd;">
          <div class="section-title">Consignor</div>
          <div><strong>${consignorName}</strong></div>
          <div>${consignorAddr || ''}</div>
          <div class="mt-sm">GSTIN: ${consignor?.gstin || '-'}</div>
        </div>
        <div class="col">
          <div class="section-title">Consignee</div>
          <div><strong>${consigneeName}</strong></div>
          <div>${consigneeAddr || ''}</div>
          <div class="mt-sm">GSTIN: ${consignee?.gstin || '-'}</div>
        </div>
      </div>

      <div class="section-title">Goods & Packages</div>
      <table>
        <thead>
          <tr>
            <th style="width:15%;">Packages</th>
            <th>Description</th>
            <th style="width:18%;">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${bilty.noOfPackages}</td>
            <td>${bilty.goodsDescription}</td>
            <td>${bilty.totalWeightKg}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Charges</div>
      <table>
        <tbody>
          <tr>
            <td>Freight</td>
            <td class="right">₹${bilty.freightAmount}</td>
          </tr>
          <tr>
            <td>Other Charges</td>
            <td class="right">₹${bilty.otherCharges ?? 0}</td>
          </tr>
          <tr>
            <td>GST</td>
            <td class="right">₹${bilty.gstAmount ?? 0}</td>
          </tr>
          <tr>
            <th>Total</th>
            <th class="right">₹${bilty.totalAmount}</th>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Status</div>
      <div class="mt-sm">Current status: <strong>${bilty.status}</strong></div>

      <div class="row mt-md">
        <div class="col">
          <div style="font-size:10px;color:#555;">
            <strong>Note:</strong> No responsibility for leakage, breakage & damage.
            Consignee is responsible for legal goods & tax matters.
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

export default function AdminBiltyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [bilty, setBilty] = useState<Bilty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [consignor, setConsignor] = useState<Party | null>(null);
  const [consignee, setConsignee] = useState<Party | null>(null);
  const [partyLoading, setPartyLoading] = useState<boolean>(false);

  const handleShare = async () => {
    if (!bilty || !id) return;

    try {
      // Ensure we have / create a public tracking link in Firestore
      const { url } = await ensureBiltyPublicLink(String(id));

      // Short message – what gets copied if user taps "Copy"
      const message = `Track this bilty online:\n${url}`;

      await Share.share({
        title: `Track bilty ${bilty.biltyNumber}`,
        message,
        url, // some platforms use this field specifically
      });
    } catch (e) {
      console.error('[AdminBiltyDetail] share tracking link error', e);
      Alert.alert(
        'Error',
        'Failed to generate tracking link. Please try again.',
      );
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Bilty',
      'Are you sure you want to delete this bilty? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBilty(String(id));
              router.replace('/(admin)/bilties');
            } catch (e) {
              console.error('[AdminBiltyDetail] Delete error', e);
              Alert.alert('Error', 'Failed to delete bilty. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleGenerateBill = async () => {
    if (!bilty) return;

    try {
      const html = buildBiltyHtml(bilty, consignor, consignee);
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
                  dialogTitle: `Share bilty ${bilty.biltyNumber}`,
                });
              } else {
                Alert.alert('PDF saved', uri);
              }
            } catch (err) {
              console.error('[AdminBiltyDetail] share PDF error', err);
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
              console.error('[AdminBiltyDetail] print PDF error', err);
              Alert.alert('Error', 'Failed to open printer dialog.');
            }
          },
        },
      ]);
    } catch (e) {
      console.error('[AdminBiltyDetail] Generate bill error', e);
      Alert.alert('Error', 'Failed to generate bill PDF. Please try again.');
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBiltyById(String(id));
        if (!data) {
          setError('Bilty not found');
        } else {
          setBilty(data);
        }
      } catch (e: any) {
        console.error('[AdminBiltyDetail] Error loading bilty', e);
        setError(e?.message || 'Failed to load bilty');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadParties = async () => {
      if (!bilty) return;

      try {
        setPartyLoading(true);
        const [consignorData, consigneeData] = await Promise.all([
          fetchPartyById(bilty.consignorId),
          fetchPartyById(bilty.consigneeId),
        ]);
        setConsignor(consignorData);
        setConsignee(consigneeData);
      } catch (e) {
        console.error('[AdminBiltyDetail] Error loading parties', e);
      } finally {
        setPartyLoading(false);
      }
    };

    loadParties();
  }, [bilty]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.infoText}>Loading bilty…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !bilty) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={[styles.infoText, { color: colors.danger }]}>
            {error || 'Bilty not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusLabel = bilty.status.replace('_', ' ');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon actions row at top */}
        <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={styles.topIconButton}
            onPress={handleShare}
            accessibilityLabel="Share bilty"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconButton}
            onPress={() => {
              if (id) {
                router.push(`/(admin)/bilties/${id}/edit`);
              }
            }}
            accessibilityLabel="Edit bilty"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconButton}
            onPress={handleDelete}
            accessibilityLabel="Delete bilty"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={colors.danger}
            />
          </TouchableOpacity>
        </View>

        {/* Header card */}
        <Card style={styles.headerCard} mode="contained">
          <Card.Content>
            <Text style={styles.biltyNumber}>{bilty.biltyNumber}</Text>
            <Text style={styles.route}>
              {bilty.origin} → {bilty.destination}
            </Text>

            <View style={styles.headerMetaRow}>
              <Chip compact style={styles.statusChip}>
                {statusLabel}
              </Chip>
              <Text style={styles.headerMetaText}>
                Total: ₹{bilty.totalAmount}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Generate Bill button */}
        <View style={styles.generateRow}>
          <Button
            mode="contained"
            onPress={handleGenerateBill}
            style={styles.fullWidthBtn}
          >
            Generate Bilty
          </Button>
        </View>

        {/* Status: timeline + history */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Status" />
          <Card.Content>
            <Text style={styles.bodyText}>Current: {statusLabel}</Text>

            {/* Pizza-style timeline */}
            {(() => {
              const currentStatus = bilty.status;
              const hasCancelled =
                currentStatus === 'cancelled' ||
                bilty.statusHistory.some((h) => h.status === 'cancelled');

              const currentIndex = STATUS_STEPS.findIndex(
                (s) => s.key === currentStatus,
              );
              const cancelledIndex = STATUS_STEPS.findIndex(
                (s) => s.key === 'cancelled',
              );
              const lastIndex = STATUS_STEPS.length - 1;

              const doneColor = '#16a34a';
              const currentColor = '#f97316';
              const cancelledColor = '#dc2626';
              const inactiveColor = colors.border;

              return (
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineRow}>
                    {STATUS_STEPS.map((step, index) => {
                      let state:
                        | 'pending'
                        | 'done'
                        | 'current'
                        | 'cancelled' = 'pending';

                      if (hasCancelled) {
                        if (index < cancelledIndex) state = 'done';
                        else if (index === cancelledIndex) state = 'cancelled';
                        else state = 'pending';
                      } else if (currentIndex >= 0) {
                        if (index < currentIndex) state = 'done';
                        else if (index === currentIndex) state = 'current';
                        else state = 'pending';
                      }

                      const colorMap = {
                        done: doneColor,
                        current: currentColor,
                        cancelled: cancelledColor,
                        pending: inactiveColor,
                      } as const;

                      const iconMap = {
                        done: 'check-circle',
                        current: 'progress-clock',
                        cancelled: 'close-circle',
                        pending: 'checkbox-blank-circle-outline',
                      } as const;

                      const color = colorMap[state];
                      const iconName = iconMap[state];

                      const showLeftBar = index > 0;
                      const leftBarActiveColor = hasCancelled
                        ? index <= cancelledIndex
                          ? colorMap.done
                          : inactiveColor
                        : currentIndex >= 0 && index <= currentIndex
                        ? colorMap.done
                        : inactiveColor;

                      return (
                        <View key={step.key} style={styles.timelineStep}>
                          <View style={styles.timelineLineRow}>
                            {showLeftBar && (
                              <View
                                style={[
                                  styles.timelineBar,
                                  { backgroundColor: leftBarActiveColor },
                                ]}
                              />
                            )}

                            <View style={styles.timelineIconWrapper}>
                              <MaterialCommunityIcons
                                name={iconName as any}
                                size={22}
                                color={color}
                              />
                            </View>

                            {index < lastIndex && (
                              <View
                                style={[
                                  styles.timelineBar,
                                  { backgroundColor: leftBarActiveColor },
                                ]}
                              />
                            )}
                          </View>
                          <Text style={styles.timelineLabel}>{step.label}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })()}

            {/* textual history */}
            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>
              History:
            </Text>
            {bilty.statusHistory.map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyStatus}>{entry.status}</Text>
                {entry.note ? (
                  <Text style={styles.bodyText}>Note: {entry.note}</Text>
                ) : null}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Goods */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Goods" />
          <Card.Content>
            <Text style={styles.bodyText}>
              Description: {bilty.goodsDescription}
            </Text>
            <Text style={styles.bodyText}>
              No. of Packages: {bilty.noOfPackages}
            </Text>
            <Text style={styles.bodyText}>
              Total Weight: {bilty.totalWeightKg} kg
            </Text>
          </Card.Content>
        </Card>

        {/* Charges */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Charges" />
          <Card.Content>
            <Text style={styles.bodyText}>
              Freight: ₹{bilty.freightAmount}
            </Text>
            <Text style={styles.bodyText}>
              Other Charges: ₹{bilty.otherCharges ?? 0}
            </Text>
            <Text style={styles.bodyText}>
              GST: ₹{bilty.gstAmount ?? 0}
            </Text>
            <Text style={styles.totalText}>Total: ₹{bilty.totalAmount}</Text>
          </Card.Content>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: 24,
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
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  topIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerCard: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
  },
  biltyNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMain,
  },
  route: {
    marginTop: 4,
    color: colors.textSubtle,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusChip: {
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  headerMetaText: {
    color: colors.textSubtle,
    fontSize: 12,
  },
  generateRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  fullWidthBtn: {
    flex: 1,
    alignSelf: 'stretch',
  },
  sectionCard: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginTop: 4,
  },
  bodyText: {
    fontSize: 13,
    color: colors.textMain,
    marginTop: 2,
  },
  totalText: {
    marginTop: 6,
    fontWeight: '700',
    color: colors.textMain,
  },
  historyItem: {
    marginTop: 4,
    paddingVertical: 2,
  },
  historyStatus: {
    fontWeight: '600',
    color: colors.textMain,
  },
  timelineContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
  },
  timelineLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  timelineBar: {
    flex: 1,
    height: 2,
    borderRadius: 999,
  },
  timelineIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  timelineLabel: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
    color: colors.textSubtle,
  },
});
