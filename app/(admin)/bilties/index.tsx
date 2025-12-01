import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchAllBilties } from '../../../src/data/biltiesRepository';
import type { Bilty } from '../../../src/models/bilty';
import { colors } from '../../../src/theme/colors';

export default function AdminBiltyListScreen() {
  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllBilties();
        setBilties(data);
      } catch (e: any) {
        console.error('[AdminBiltyList] Error loading bilties', e);
        setError(e?.message || 'Failed to load bilties');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const renderItem = ({ item }: { item: Bilty }) => (
    <Link
      href={`/(admin)/bilties/${item.id}`}
      asChild
    >
      <TouchableOpacity style={styles.card}>
        <Text style={styles.biltyNumber}>{item.biltyNumber}</Text>
        <Text style={styles.route}>
          {item.origin} → {item.destination}
        </Text>
        <Text style={styles.meta}>
          Status: {item.status} • Amount: ₹{item.totalAmount}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Bilties (Admin)</Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.infoText}>Loading bilties…</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.center}>
          <Text style={[styles.infoText, { color: 'red' }]}>{error}</Text>
        </View>
      )}

      {!loading && !error && bilties.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.infoText}>No bilties found.</Text>
        </View>
      )}

      {!loading && !error && bilties.length > 0 && (
        <FlatList
          data={bilties}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.textMain,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  biltyNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.textMain,
  },
  route: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.textMain,
  },
  meta: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  center: {
    marginTop: 16,
    alignItems: 'center',
  },
  infoText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSubtle,
  },
});
