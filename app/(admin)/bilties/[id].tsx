import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchBiltyById } from '../../../src/data/biltiesRepository';
import type { Bilty } from '../../../src/models/bilty';
import { colors } from '../../../src/theme/colors';

export default function AdminBiltyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [bilty, setBilty] = useState<Bilty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.infoText}>Loading bilty…</Text>
      </View>
    );
  }

  if (error || !bilty) {
    return (
      <View style={styles.center}>
        <Text style={[styles.infoText, { color: 'red' }]}>{error || 'Bilty not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{bilty.biltyNumber}</Text>
      <Text style={styles.route}>
        {bilty.origin} → {bilty.destination}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goods</Text>
        <Text>Description: {bilty.goodsDescription}</Text>
        <Text>No. of Packages: {bilty.noOfPackages}</Text>
        <Text>Total Weight: {bilty.totalWeightKg} kg</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Charges</Text>
        <Text>Freight: ₹{bilty.freightAmount}</Text>
        <Text>Other Charges: ₹{bilty.otherCharges ?? 0}</Text>
        <Text>GST: ₹{bilty.gstAmount ?? 0}</Text>
        <Text style={styles.total}>Total: ₹{bilty.totalAmount}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text>Current: {bilty.status}</Text>
        <Text style={styles.sectionSubtitle}>History:</Text>
        {bilty.statusHistory.map((entry, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyStatus}>{entry.status}</Text>
            {entry.note ? <Text>Note: {entry.note}</Text> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: colors.textMain,
  },
  route: {
    fontSize: 16,
    marginBottom: 16,
    color: colors.textMain,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.textMain,
  },
  sectionSubtitle: {
    marginTop: 6,
    fontWeight: '600',
    color: colors.textMain,
  },
  historyItem: {
    marginTop: 4,
    paddingVertical: 4,
  },
  historyStatus: {
    fontWeight: '600',
    color: colors.textMain,
  },
  total: {
    marginTop: 4,
    fontWeight: '700',
    color: colors.textMain,
  },
});
