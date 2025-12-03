import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { fetchAllBilties } from '../../../src/data/biltiesRepository';
import type { Bilty } from '../../../src/models/bilty';
import { colors } from '../../../src/theme/colors';

export default function AdminBiltyListScreen() {
    const [bilties, setBilties] = useState<Bilty[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'created' | 'in_transit' | 'delivered'>('all');
    const [searchText, setSearchText] = useState<string>('');
    const [recentFilter, setRecentFilter] = useState<'all' | '7d' | '30d'>('all');

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
        const filteredBilties = bilties.filter((b) => {
            // 1) Status filter
            if (statusFilter !== 'all' && b.status !== statusFilter) {
                return false;
            }

            // 2) Recent filter
            if (recentFilter !== 'all') {
                const now = Date.now();
                const ageMs = now - b.date;
                const days =
                    recentFilter === '7d'
                        ? 7
                        : recentFilter === '30d'
                            ? 30
                            : 0;
                if (days > 0) {
                    const maxAgeMs = days * 24 * 60 * 60 * 1000;
                    if (ageMs > maxAgeMs) return false;
                }
            }

            // 3) Search filter: biltyNumber, origin, destination, goodsDescription
            if (searchText.trim().length > 0) {
                const q = searchText.trim().toLowerCase();
                const haystack =
                    [
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
            {/* Search bar */}
            <TextInput
                placeholder="Search by bilty no, origin, destination, goods…"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
            />

            {/* Recent filter chips */}
            <View style={styles.recentFilterRow}>
                {(['all', '7d', '30d'] as const).map((val) => {
                    const isActive = recentFilter === val;
                    const label =
                        val === 'all'
                            ? 'All dates'
                            : val === '7d'
                                ? 'Last 7 days'
                                : 'Last 30 days';

                    return (
                        <Text
                            key={val}
                            style={[
                                styles.filterChip,
                                isActive && styles.filterChipActive,
                            ]}
                            onPress={() => setRecentFilter(val)}
                        >
                            {label}
                        </Text>
                    );
                })}
            </View>

            <View style={styles.filterRow}>
                {(['all', 'created', 'in_transit', 'delivered'] as const).map((val) => {
                    const isActive = statusFilter === val;
                    return (
                        <Text
                            key={val}
                            style={[
                                styles.filterChip,
                                isActive && styles.filterChipActive,
                            ]}
                            onPress={() => setStatusFilter(val)}
                        >
                            {val === 'all' ? 'All' : val.replace('_', ' ')}
                        </Text>
                    );
                })}
            </View>

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
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    filterChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
        marginBottom: 8,
        fontSize: 12,
        color: colors.textMain,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryDark,
        color: '#ffffff',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        backgroundColor: colors.surface,
    },
    recentFilterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
});
