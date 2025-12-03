import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { fetchBiltiesForConsignee } from '../../../../src/data/biltiesRepository';
import { fetchPartyById } from '../../../../src/data/partiesRepository';
import type { Bilty } from '../../../../src/models/bilty';
import type { Party } from '../../../../src/models/party';
import { colors } from '../../../../src/theme/colors';

export default function CustomerBiltiesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [customer, setCustomer] = useState<Party | null>(null);
  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [party, biltyList] = await Promise.all([
          fetchPartyById(String(id)),
          fetchBiltiesForConsignee(String(id)),
        ]);
        setCustomer(party);
        setBilties(biltyList);
      } catch (e: any) {
        console.error('[CustomerBilties] Error loading data', e);
        setError(e?.message || 'Failed to load customer bilties');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const renderItem = ({ item }: { item: Bilty }) => (
    <Link
      href={{
        pathname: '/(admin)/bilties/[id]',
        params: { id: item.id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.card}>
        <Text style={styles.biltyNumber}>{item.biltyNumber}</Text>
        <Text style={styles.route}>
          {item.origin} → {item.destination}
        </Text>
        <Text style={styles.small}>
          Status: {item.status} • ₹{item.totalAmount}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.infoText}>Loading bilties…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.infoText, { color: 'red' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {customer?.name ?? 'Customer'}
        </Text>
        {customer?.city && customer?.state && (
          <Text style={styles.subtitle}>
            {customer.city}, {customer.state}
          </Text>
        )}
      </View>

      <FlatList
        data={bilties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.infoText}>
            No bilties found for this customer yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSubtle,
  },
  listContent: {
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
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  biltyNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
  },
  route: {
    fontSize: 14,
    marginTop: 2,
    color: colors.textMain,
  },
  small: {
    fontSize: 12,
    marginTop: 4,
    color: colors.textSubtle,
  },
});
