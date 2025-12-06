import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Text,
} from 'react-native-paper';
import { StatusListItem } from '../../../src/components/ui/StatusListItem';
import { fetchBiltiesForConsignee } from '../../../src/data/biltiesRepository';
import {
    deactivateCustomerAccount,
    fetchCustomerParties,
} from '../../../src/data/partiesRepository';
import type { Party } from '../../../src/models/party';
import { colors } from '../../../src/theme/colors';

export default function CustomersListScreen() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Party[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCustomerParties();
        setCustomers(data);
      } catch (e: any) {
        console.error('[CustomersList] Error loading customers', e);
        setError(e?.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDeleteCustomer = async (customer: Party) => {
    try {
      const bilties = await fetchBiltiesForConsignee(customer.id);

      if (bilties.length > 0) {
        Alert.alert(
          'Deactivate Customer',
          `This customer has ${bilties.length} bilties. We’ll deactivate it so it can’t be used for new bilties, but existing records remain intact.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Deactivate',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deactivateCustomerAccount(customer.id);
                  setCustomers((prev) =>
                    prev.filter((c) => c.id !== customer.id),
                  );
                } catch (e) {
                  console.error(
                    '[CustomersList] Deactivate customer error',
                    e,
                  );
                  Alert.alert('Error', 'Failed to deactivate customer.');
                }
              },
            },
          ],
        );
        return;
      }

      Alert.alert(
        'Delete Customer',
        'This customer has no bilties. Delete it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deactivateCustomerAccount(customer.id);
                setCustomers((prev) =>
                  prev.filter((c) => c.id !== customer.id),
                );
              } catch (e) {
                console.error('[CustomersList] Delete customer error', e);
                Alert.alert('Error', 'Failed to delete customer.');
              }
            },
          },
        ],
      );
    } catch (e) {
      console.error('[CustomersList] Pre-delete check error', e);
      Alert.alert('Error', 'Failed to check customer bilties.');
    }
  };

  const renderItem = ({ item }: { item: Party }) => {
    const subtitleParts: string[] = [];
    if (item.city && item.state) {
      subtitleParts.push(`${item.city}, ${item.state}`);
    }
    if (item.gstin) {
      subtitleParts.push(`GSTIN: ${item.gstin}`);
    }

    return (
      <View style={styles.itemWrapper}>
        <StatusListItem
          title={item.name}
          subtitle={subtitleParts.join(' • ')}
          iconName="account-group-outline"
          iconColor={colors.accentBlue}
          onPress={() =>
            router.push({
              pathname: '/(admin)/customers/[id]/bilties',
              params: { id: item.id },
            })
          }
        />
        <View style={styles.itemActions}>
          <Button
            mode="text"
            compact
            onPress={() => handleDeleteCustomer(item)}
            textColor={colors.danger}
          >
            Delete
          </Button>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.infoText}>Loading customers…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Customers</Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(admin)/customers/new')}
        >
          Add Customer
        </Button>
      </View>

      <View style={styles.listContent}>
        {customers.length === 0 ? (
          <Text style={styles.infoText}>No customers yet.</Text>
        ) : (
          // @ts-ignore
          <FlatList
            data={customers}
            keyExtractor={(item: Party) => item.id}
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
  },
  listContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemWrapper: {
    marginBottom: 4,
  },
  itemActions: {
    alignItems: 'flex-end',
    marginRight: 8,
    marginBottom: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSubtle,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.danger,
  },
});
