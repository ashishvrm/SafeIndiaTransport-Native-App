// app/(admin)/index.tsx
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { AdminBottomNav } from '../../src/components/AdminBottomNav';
import { useAuth } from '../../src/context/AuthContext';

import { fetchAllBilties } from '../../src/data/biltiesRepository';
import { fetchCustomerParties } from '../../src/data/partiesRepository';
import type { Bilty } from '../../src/models/bilty';
import type { Party } from '../../src/models/party';

export default function AdminDashboardScreen() {
  const { user, signOutUser } = useAuth();

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

  // Overdue = has a dueDate/expectedDeliveryDate in the past and not delivered/cancelled
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

  const renderBiltyRow = (bilty: Bilty) => (
    <View key={bilty.id} style={styles.biltyRow}>
      <Text variant="bodyMedium" style={styles.biltyTitle}>
        {bilty.biltyNumber}
      </Text>
      <Text variant="bodySmall" style={styles.biltySub}>
        {bilty.origin} → {bilty.destination} • {bilty.status}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Admin Dashboard
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Welcome, {user?.email}
            </Text>
          </View>

          {loading && (
            <Card style={styles.card}>
              <Card.Content style={styles.rowCenter}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Loading dashboard…</Text>
              </Card.Content>
            </Card>
          )}

          {error && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.errorText}>{error}</Text>
              </Card.Content>
            </Card>
          )}

          {/* 1. Total Bilties */}
          <Card style={styles.card}>
            <Card.Title title="Total Bilties" />
            <Card.Content>
              <Text variant="displaySmall" style={styles.metric}>
                {totalBilties}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Link href="/(admin)/bilties" asChild>
                <Button mode="contained-tonal">View all Bilties</Button>
              </Link>
            </Card.Actions>
          </Card>

          {/* 2. Total Customers */}
          <Card style={styles.card}>
            <Card.Title title="Total Customers" />
            <Card.Content>
              <Text variant="displaySmall" style={styles.metric}>
                {totalCustomers}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Link href="/(admin)/customers" asChild>
                <Button mode="contained-tonal">View all Customers</Button>
              </Link>
            </Card.Actions>
          </Card>

          {/* 3. In progress bilties */}
          <Card style={styles.card}>
            <Card.Title
              title="In Progress Bilties"
              subtitle="Created or in transit"
            />
            <Card.Content>
              {inProgressBilties.length === 0 ? (
                <Text variant="bodySmall" style={styles.emptyText}>
                  No in-progress bilties.
                </Text>
              ) : (
                inProgressBilties.slice(0, 5).map(renderBiltyRow)
              )}
            </Card.Content>
          </Card>

          {/* 4. Completed bilties */}
          <Card style={styles.card}>
            <Card.Title title="All Completed Bilties" subtitle="Delivered" />
            <Card.Content>
              {completedBilties.length === 0 ? (
                <Text variant="bodySmall" style={styles.emptyText}>
                  No completed bilties yet.
                </Text>
              ) : (
                completedBilties.slice(0, 5).map(renderBiltyRow)
              )}
            </Card.Content>
          </Card>

          {/* 5. Overdue bilties */}
          <Card style={styles.card}>
            <Card.Title
              title="Overdue Bilties"
              subtitle="Past due date and not delivered"
            />
            <Card.Content>
              {overdueBilties.length === 0 ? (
                <Text variant="bodySmall" style={styles.emptyText}>
                  No overdue bilties. 🎉
                </Text>
              ) : (
                overdueBilties.slice(0, 5).map(renderBiltyRow)
              )}
            </Card.Content>
          </Card>

          {/* Account / Sign out */}
          <Card style={styles.card}>
            <Card.Title title="Account" subtitle="Manage your admin account" />
            <Card.Actions>
              <Button mode="text" onPress={signOutUser}>
                Sign Out
              </Button>
            </Card.Actions>
          </Card>

          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* Bottom nav stays as-is */}
      <AdminBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  card: {
    marginBottom: 12,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  errorText: {
    color: '#DC2626',
  },
  metric: {
    fontWeight: '700',
  },
  emptyText: {
    opacity: 0.7,
  },
  biltyRow: {
    marginBottom: 8,
  },
  biltyTitle: {
    fontWeight: '600',
  },
  biltySub: {
    opacity: 0.7,
  },
  ml: {
    marginLeft: 8,
  },
});
