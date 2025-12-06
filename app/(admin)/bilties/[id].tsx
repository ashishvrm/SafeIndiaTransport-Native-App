import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Text,
} from 'react-native-paper';
import { deleteBilty, fetchBiltyById } from '../../../src/data/biltiesRepository';
import { fetchPartyById } from '../../../src/data/partiesRepository';
import type { Bilty } from '../../../src/models/bilty';
import type { Party } from '../../../src/models/party';
import { colors } from '../../../src/theme/colors';

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
    if (!bilty) return;

    const consignorName = consignor?.name ?? bilty.consignorId;
    const consigneeName = consignee?.name ?? bilty.consigneeId;

    const lines = [
      `Bilty No: ${bilty.biltyNumber}`,
      `Route: ${bilty.origin} → ${bilty.destination}`,
      '',
      `Consignor: ${consignorName}`,
      consignor?.city && consignor?.state
        ? `  ${consignor.city}, ${consignor.state}`
        : '',
      consignor?.gstin ? `  GSTIN: ${consignor.gstin}` : '',
      '',
      `Consignee: ${consigneeName}`,
      consignee?.city && consignee?.state
        ? `  ${consignee.city}, ${consignee.state}`
        : '',
      consignee?.gstin ? `  GSTIN: ${consignee.gstin}` : '',
      '',
      `Goods: ${bilty.goodsDescription}`,
      `Packages: ${bilty.noOfPackages}, Weight: ${bilty.totalWeightKg} kg`,
      '',
      'Charges:',
      `  Freight: ₹${bilty.freightAmount}`,
      `  Other: ₹${bilty.otherCharges ?? 0}`,
      `  GST: ₹${bilty.gstAmount ?? 0}`,
      `  Total: ₹${bilty.totalAmount}`,
      '',
      `Status: ${bilty.status}`,
    ].filter(Boolean);

    try {
      await Share.share({
        title: `Bilty ${bilty.biltyNumber}`,
        message: lines.join('\n'),
      });
    } catch (e) {
      console.error('[AdminBiltyDetail] Share error', e);
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
              Alert.alert(
                'Error',
                'Failed to delete bilty. Please try again.',
              );
            }
          },
        },
      ],
    );
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

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button mode="outlined" onPress={handleShare} style={styles.actionBtn}>
            Share Bilty
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              if (id) {
                router.push(`/(admin)/bilties/${id}/edit`);
              }
            }}
            style={styles.actionBtn}
          >
            Edit Bilty
          </Button>
        </View>

        <View style={styles.actionsRow}>
          <Button
            mode="text"
            textColor={colors.danger}
            onPress={handleDelete}
            style={styles.fullWidthBtn}
          >
            Delete Bilty
          </Button>
        </View>

        {/* Parties */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Parties" />
          <Card.Content>
            {partyLoading && (
              <Text style={styles.infoText}>Loading party details…</Text>
            )}

            <Text style={styles.sectionLabel}>Consignor</Text>
            <Text style={styles.boldText}>
              {consignor?.name ?? bilty.consignorId}
            </Text>
            {consignor && (
              <>
                {consignor.city && consignor.state && (
                  <Text style={styles.bodyText}>
                    {consignor.city}, {consignor.state}
                  </Text>
                )}
                {consignor.gstin && (
                  <Text style={styles.bodyText}>
                    GSTIN: {consignor.gstin}
                  </Text>
                )}
              </>
            )}

            <View style={styles.sectionSpacer} />

            <Text style={styles.sectionLabel}>Consignee</Text>
            <Text style={styles.boldText}>
              {consignee?.name ?? bilty.consigneeId}
            </Text>
            {consignee && (
              <>
                {consignee.city && consignee.state && (
                  <Text style={styles.bodyText}>
                    {consignee.city}, {consignee.state}
                  </Text>
                )}
                {consignee.gstin && (
                  <Text style={styles.bodyText}>
                    GSTIN: {consignee.gstin}
                  </Text>
                )}
              </>
            )}
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
            <Text style={styles.totalText}>
              Total: ₹{bilty.totalAmount}
            </Text>
          </Card.Content>
        </Card>

        {/* Status */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Status" />
          <Card.Content>
            <Text style={styles.bodyText}>Current: {statusLabel}</Text>
            <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  fullWidthBtn: {
    flex: 1,
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
  boldText: {
    fontWeight: '600',
    color: colors.textMain,
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
  sectionSpacer: {
    height: 10,
  },
  historyItem: {
    marginTop: 4,
    paddingVertical: 2,
  },
  historyStatus: {
    fontWeight: '600',
    color: colors.textMain,
  },
});
