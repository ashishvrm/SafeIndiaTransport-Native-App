import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { AdminBottomNav } from '../../src/components/AdminBottomNav';
import { useAuth } from '../../src/context/AuthContext';

import { StatCard } from '../../src/components/ui/StatCard';
import { StatusListItem } from '../../src/components/ui/StatusListItem';
import { fetchAllBilties } from '../../src/data/biltiesRepository';
import { fetchCustomerParties } from '../../src/data/partiesRepository';
import type { Bilty } from '../../src/models/bilty';
import type { Party } from '../../src/models/party';
import { colors } from '../../src/theme/colors';

export default function AdminDashboardScreen() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [customers, setCustomers] = useState<Party[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [biltyData, customerData] = await Promise.all([
          fetchAllBilties(),
          fetchCustomerParties(),
        ]);

        setBilties(biltyData);
        setCustomers(customerData);
      } catch (e: any) {
        console.error('[AdminDashboard] Error loading data', e);
        setError(e?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalBilties = bilties.length;
  const totalCustomers = customers.length;

  const inProgressBilties = bilties.filter(
    (b) => b.status === 'created' || b.status === 'in_transit',
  );
  const completedBilties = bilties.filter((b) => b.status === 'delivered');

  const now = Date.now();
  const overdueBilties = bilties.filter((b) => {
    const anyB = b as any;
    const rawDue = anyB.dueDate ?? anyB.expectedDeliveryDate;
    if (!rawDue) return false;
    const dueMs =
      typeof rawDue === 'number' ? rawDue : new Date(rawDue).getTime();
    if (!dueMs || Number.isNaN(dueMs)) return false;
    return (
      dueMs < now && b.status !== 'delivered' && b.status !== 'cancelled'
    );
  });

  const renderBiltyRow = (
    bilty: Bilty,
    iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'],
    iconColor: string
  ) => (
    <StatusListItem
      key={bilty.id}
      title={bilty.biltyNumber}
      subtitle={`${bilty.origin} → ${bilty.destination}`}
      iconName={iconName}
      iconColor={iconColor}
      onPress={() =>
        router.push({
          pathname: '/(admin)/bilties/[id]',
          params: { id: bilty.id },
        })
      }
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Welcome, {user?.email}
            </Text>
          </View>

          {/* Loading / error */}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading dashboard…</Text>
            </View>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Total bilties */}
          <StatCard
            title="Total Bilties"
            value={totalBilties}
            subtitle="All bilties in the system"
            actionLabel="View all Bilties"
            onPressAction={() => router.push('/(admin)/bilties')}
            tone="primary"
          />

          {/* Total customers */}
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            subtitle="Your client accounts"
            actionLabel="View all Customers"
            onPressAction={() => router.push('/(admin)/customers')}
          />

          {/* In progress */}
          <StatCard
            title="In progress Bilties"
            subtitle="Created or in transit"
          >
            {inProgressBilties.length === 0 ? (
              <Text style={styles.emptyText}>No in-progress bilties.</Text>
            ) : (
              inProgressBilties
                .slice(0, 5)
                .map((b) =>
                  renderBiltyRow(b, 'truck-delivery-outline', colors.accentBlue),
                )
            )}
          </StatCard>

          {/* Completed */}
          <StatCard title="All completed Bilties" subtitle="Delivered">
            {completedBilties.length === 0 ? (
              <Text style={styles.emptyText}>No completed bilties yet.</Text>
            ) : (
              completedBilties
                .slice(0, 5)
                .map((b) =>
                  renderBiltyRow(b, 'check-circle-outline', colors.accentGreen),
                )
            )}
          </StatCard>

          {/* Overdue */}
          <StatCard
            title="Overdue Bilties"
            subtitle="Past due date & not delivered"
          >
            {overdueBilties.length === 0 ? (
              <Text style={styles.emptyText}>No overdue bilties. 🎉</Text>
            ) : (
              overdueBilties
                .slice(0, 5)
                .map((b) =>
                  renderBiltyRow(b, 'alert-circle-outline', colors.danger),
                )
            )}
          </StatCard>
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      <AdminBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
  },
  headerSubtitle: {
    marginTop: 4,
    color: colors.textSubtle,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSubtle,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  signOutBtn: {
    marginLeft: 8,
  },
});
