import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Text,
} from 'react-native-paper';
import { StatusListItem } from '../../../../src/components/ui/StatusListItem';
import { fetchBiltiesForConsignee } from '../../../../src/data/biltiesRepository';
import { fetchPartyById } from '../../../../src/data/partiesRepository';
import type { Bilty } from '../../../../src/models/bilty';
import type { Party } from '../../../../src/models/party';
import { colors } from '../../../../src/theme/colors';

export default function CustomerBiltiesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

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

  const renderItem = ({ item }: { item: Bilty }) => {
    let iconName: React.ComponentProps<
      typeof StatusListItem
    >['iconName'] = 'file-document-outline';
    let iconColor = colors.accentBlue;

    if (item.status === 'in_transit') {
      iconName = 'truck-delivery-outline';
      iconColor = colors.accentYellow;
    } else if (item.status === 'delivered') {
      iconName = 'check-circle-outline';
      iconColor = colors.accentGreen;
    }

    const subtitle = `${item.origin} → ${item.destination} • ₹${
      item.totalAmount
    } • ${item.status.replace('_', ' ')}`;

    return (
      <StatusListItem
        title={item.biltyNumber}
        subtitle={subtitle}
        iconName={iconName}
        iconColor={iconColor}
        onPress={() =>
          router.push({
            pathname: '/(admin)/bilties/[id]',
            params: { id: item.id },
          })
        }
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.infoText}>Loading bilties…</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>{customer?.name ?? 'Customer'}</Text>
        {customer?.city && customer?.state && (
          <Text style={styles.subtitle}>
            {customer.city}, {customer.state}
          </Text>
        )}

        {id && (
          <View style={styles.headerActions}>
            <Button
              mode="contained"
              onPress={() =>
                router.push({
                  pathname: '/(admin)/bilties/new',
                  params: { consigneeId: String(id) },
                })
              }
            >
              New Bilty
            </Button>
          </View>
        )}
      </View>

      <View style={styles.listContainer}>
        {bilties.length === 0 ? (
          <Text style={styles.infoText}>
            No bilties found for this customer yet.
          </Text>
        ) : (
          // @ts-ignore
          <FlatList
            data={bilties}
            keyExtractor={(item: Bilty) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
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
    marginTop: 2,
    color: colors.textSubtle,
  },
  headerActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
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
