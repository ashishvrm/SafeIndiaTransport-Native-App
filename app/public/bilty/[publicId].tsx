import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import { fetchBiltyByPublicId } from '../../../src/data/biltiesRepository';
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

export default function PublicBiltyStatusScreen() {
  const { publicId } = useLocalSearchParams<{ publicId: string }>();

  const [bilty, setBilty] = useState<Bilty | null>(null);
  const [consignor, setConsignor] = useState<Party | null>(null);
  const [consignee, setConsignee] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [partyLoading, setPartyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!publicId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBiltyByPublicId(String(publicId));
        if (!data) {
          setError('Bilty not found');
        } else {
          setBilty(data);
        }
      } catch (e: any) {
        console.error('[PublicBilty] load error', e);
        setError(e?.message || 'Failed to load bilty');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [publicId]);

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
        console.error('[PublicBilty] parties error', e);
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
        <Card style={styles.headerCard} mode="contained">
          <Card.Content>
            <Text style={styles.title}>Bilty Tracking</Text>
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

        {/* Simple status timeline for public view */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Status" />
          <Card.Content>
            <Text style={styles.bodyText}>Current: {statusLabel}</Text>

            <View style={styles.timelineContainer}>
              <View style={styles.timelineRow}>
                {STATUS_STEPS.map((step, index) => {
                  const currentIndex = STATUS_STEPS.findIndex(
                    (s) => s.key === bilty.status,
                  );
                  const lastIndex = STATUS_STEPS.length - 1;

                  let state: 'pending' | 'done' | 'current' = 'pending';
                  if (index < currentIndex) state = 'done';
                  else if (index === currentIndex) state = 'current';

                  const colorMap = {
                    done: '#16a34a',
                    current: '#f97316',
                    pending: colors.border,
                  } as const;

                  const iconMap = {
                    done: 'check-circle',
                    current: 'progress-clock',
                    pending: 'checkbox-blank-circle-outline',
                  } as const;

                  const color = colorMap[state];
                  const iconName = iconMap[state];

                  const showLeftBar = index > 0;
                  const barColor =
                    currentIndex >= 0 && index <= currentIndex
                      ? colorMap.done
                      : colors.border;

                  return (
                    <View key={step.key} style={styles.timelineStep}>
                      <View style={styles.timelineLineRow}>
                        {showLeftBar && (
                          <View
                            style={[
                              styles.timelineBar,
                              { backgroundColor: barColor },
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
                              { backgroundColor: barColor },
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
          </Card.Content>
        </Card>

        {/* Basic parties info for receiver */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Consignor & Consignee" />
          <Card.Content>
            <Text style={styles.label}>Consignor</Text>
            <Text style={styles.bodyText}>
              {consignor?.name ?? bilty.consignorId}
            </Text>
            <Text style={styles.label}>Consignee</Text>
            <Text style={styles.bodyText}>
              {consignee?.name ?? bilty.consigneeId}
            </Text>
            {partyLoading && (
              <Text style={styles.infoText}>Loading party details…</Text>
            )}
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
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
  sectionCard: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
  },
  bodyText: {
    fontSize: 13,
    color: colors.textMain,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
    marginTop: 6,
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
