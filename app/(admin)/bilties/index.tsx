import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Chip,
    Text,
    TextInput,
} from 'react-native-paper';
import { StatusListItem } from '../../../src/components/ui/StatusListItem';
import { fetchAllBilties } from '../../../src/data/biltiesRepository';
import type { Bilty } from '../../../src/models/bilty';
import { colors } from '../../../src/theme/colors';

type StatusFilter = 'all' | 'created' | 'in_transit' | 'delivered';
type RecentFilter = 'all' | '7d' | '30d';

export default function AdminBiltyListScreen() {
  const router = useRouter();

  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [recentFilter, setRecentFilter] = useState<RecentFilter>('all');
  const [searchText, setSearchText] = useState<string>('');

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

  const filteredBilties = useMemo(() => {
    const now = Date.now();

    return bilties.filter((b) => {
      // 1) Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }

      // 2) Recent filter
      if (recentFilter !== 'all') {
        const ageMs = now - b.date;
        const days =
          recentFilter === '7d' ? 7 : recentFilter === '30d' ? 30 : 0;

        if (days > 0) {
          const maxAgeMs = days * 24 * 60 * 60 * 1000;
          if (ageMs > maxAgeMs) return false;
        }
      }

      // 3) Search filter
      if (searchText.trim().length > 0) {
        const q = searchText.trim().toLowerCase();
        const haystack = [
          b.biltyNumber,
          b.origin,
          b.destination,
          b.goodsDescription,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [bilties, statusFilter, recentFilter, searchText]);

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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>All Bilties</Text>

        {/* Filters */}
        <TextInput
          mode="outlined"
          placeholder="Search by number, route, goods…"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        <View style={styles.filterRow}>
          {(['all', '7d', '30d'] as RecentFilter[]).map((val) => {
            const label =
              val === 'all'
                ? 'All dates'
                : val === '7d'
                ? 'Last 7 days'
                : 'Last 30 days';

            return (
              <Chip
                key={val}
                selected={recentFilter === val}
                onPress={() => setRecentFilter(val)}
                style={styles.chip}
              >
                {label}
              </Chip>
            );
          })}
        </View>

        <View style={styles.filterRow}>
          {(['all', 'created', 'in_transit', 'delivered'] as StatusFilter[]).map(
            (val) => (
              <Chip
                key={val}
                selected={statusFilter === val}
                onPress={() => setStatusFilter(val)}
                style={styles.chip}
              >
                {val === 'all' ? 'All status' : val.replace('_', ' ')}
              </Chip>
            ),
          )}
        </View>

        <View style={styles.actionsRow}>
          <Button
            mode="contained"
            onPress={() => router.push('/(admin)/bilties/new')}
          >
            New Bilty
          </Button>
        </View>

        {/* Content */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.infoText}>Loading bilties…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && filteredBilties.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.infoText}>No bilties match your filters.</Text>
          </View>
        )}

        {!loading && !error && filteredBilties.length > 0 && (
          <View style={styles.listWrapper}>
            {/* FlatList is fine; this wrapper just adds padding */}
            {/* @ts-ignore */}
            <FlatList
              data={filteredBilties}
              keyExtractor={(item: Bilty) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  searchInput: {
    marginTop: 4,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  actionsRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  center: {
    marginTop: 24,
    alignItems: 'center',
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
