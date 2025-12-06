import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Text,
} from 'react-native-paper';
import { deleteBilty, fetchBiltyById } from '../../../src/data/biltiesRepository';
import { fetchPartyById } from '../../../src/data/partiesRepository';
import type { Bilty } from '../../../src/models/bilty';
import type { Party } from '../../../src/models/party';
import { colors } from '../../../src/theme/colors';

export default function AdminBiltyDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [bilty, setBilty] = useState<Bilty | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [consignor, setConsignor] = useState<Party | null>(null);
    const [consignee, setConsignee] = useState<Party | null>(null);
    const [partyLoading, setPartyLoading] = useState<boolean>(false);
    const STATUS_STEPS = [
        { key: 'created', label: 'Created' },
        { key: 'loaded', label: 'Loaded' },
        { key: 'in_transit', label: 'In transit' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'cancelled', label: 'Cancelled' },
    ] as const;

    const handleShare = async () => {
        if (!bilty) return;

        const consignorName = consignor?.name ?? bilty.consignorId;
        const consigneeName = consignee?.name ?? bilty.consigneeId;

        const lines = [
            `Bilty No: ${bilty.biltyNumber}`,
            `Route: ${bilty.origin} → ${bilty.destination}`,
            '',
            `Consignor: ${consignorName}`,
            consignor?.city && consignor?.state
                ? `  ${consignor.city}, ${consignor.state}`
                : '',
            consignor?.gstin ? `  GSTIN: ${consignor.gstin}` : '',
            '',
            `Consignee: ${consigneeName}`,
            consignee?.city && consignee?.state
                ? `  ${consignee.city}, ${consignee.state}`
                : '',
            consignee?.gstin ? `  GSTIN: ${consignee.gstin}` : '',
            '',
            `Goods: ${bilty.goodsDescription}`,
            `Packages: ${bilty.noOfPackages}, Weight: ${bilty.totalWeightKg} kg`,
            '',
            'Charges:',
            `  Freight: ₹${bilty.freightAmount}`,
            `  Other: ₹${bilty.otherCharges ?? 0}`,
            `  GST: ₹${bilty.gstAmount ?? 0}`,
            `  Total: ₹${bilty.totalAmount}`,
            '',
            `Status: ${bilty.status}`,
        ].filter(Boolean);

        try {
            await Share.share({
                title: `Bilty ${bilty.biltyNumber}`,
                message: lines.join('\n'),
            });
        } catch (e) {
            console.error('[AdminBiltyDetail] Share error', e);
        }
    };

    const handleDelete = () => {
        if (!id) return;

        Alert.alert(
            'Delete Bilty',
            'Are you sure you want to delete this bilty? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteBilty(String(id));
                            router.replace('/(admin)/bilties');
                        } catch (e) {
                            console.error('[AdminBiltyDetail] Delete error', e);
                            Alert.alert(
                                'Error',
                                'Failed to delete bilty. Please try again.',
                            );
                        }
                    },
                },
            ],
        );
    };

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
                console.error('[AdminBiltyDetail] Error loading parties', e);
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
                {/* Header card */}
                <Card style={styles.headerCard} mode="contained">
                    <Card.Content>
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

                {/* Actions */}
                <View style={styles.actionsRow}>
                    <Button mode="outlined" onPress={handleShare} style={styles.actionBtn}>
                        Share Bilty
                    </Button>
                    <Button
                        mode="contained"
                        onPress={() => {
                            if (id) {
                                router.push(`/(admin)/bilties/${id}/edit`);
                            }
                        }}
                        style={styles.actionBtn}
                    >
                        Edit Bilty
                    </Button>
                </View>

                <View style={styles.actionsRow}>
                    <Button
                        mode="text"
                        textColor={colors.danger}
                        onPress={handleDelete}
                        style={styles.fullWidthBtn}
                    >
                        Delete Bilty
                    </Button>
                </View>

                {/* Parties */}
                <Card style={styles.sectionCard}>
                    <Card.Title title="Status" />
                    <Card.Content>
                        {/* Current status text */}
                        <Text style={styles.bodyText}>Current: {statusLabel}</Text>

                        {/* Pizza-delivery style timeline */}
                        {(() => {
                            const currentStatus = bilty.status;
                            const hasCancelled =
                                currentStatus === 'cancelled' ||
                                bilty.statusHistory.some((h) => h.status === 'cancelled');

                            const currentIndex = STATUS_STEPS.findIndex(
                                (s) => s.key === currentStatus,
                            );
                            const cancelledIndex = STATUS_STEPS.findIndex(
                                (s) => s.key === 'cancelled',
                            );
                            const lastIndex = STATUS_STEPS.length - 1;

                            const doneColor = '#16a34a'; // green
                            const currentColor = '#f97316'; // orange
                            const cancelledColor = '#dc2626'; // red
                            const inactiveColor = colors.border;

                            return (
                                <View style={styles.timelineContainer}>
                                    <View style={styles.timelineRow}>
                                        {STATUS_STEPS.map((step, index) => {
                                            let state: 'pending' | 'done' | 'current' | 'cancelled' =
                                                'pending';

                                            if (hasCancelled) {
                                                if (index < cancelledIndex) state = 'done';
                                                else if (index === cancelledIndex) state = 'cancelled';
                                                else state = 'pending';
                                            } else if (currentIndex >= 0) {
                                                if (index < currentIndex) state = 'done';
                                                else if (index === currentIndex) state = 'current';
                                                else state = 'pending';
                                            }

                                            const colorMap = {
                                                done: doneColor,
                                                current: currentColor,
                                                cancelled: cancelledColor,
                                                pending: inactiveColor,
                                            } as const;

                                            const iconMap = {
                                                done: 'check-circle',
                                                current: 'progress-clock',
                                                cancelled: 'close-circle',
                                                pending: 'checkbox-blank-circle-outline',
                                            } as const;

                                            const color = colorMap[state];
                                            const iconName = iconMap[state];

                                            // connector line to the left of this node
                                            const showLeftBar = index > 0;
                                            const leftBarActiveColor = hasCancelled
                                                ? index <= cancelledIndex
                                                    ? colorMap.done
                                                    : inactiveColor
                                                : currentIndex >= 0 && index <= currentIndex
                                                    ? colorMap.done
                                                    : inactiveColor;

                                            return (
                                                <View key={step.key} style={styles.timelineStep}>
                                                    <View style={styles.timelineLineRow}>
                                                        {showLeftBar && (
                                                            <View
                                                                style={[
                                                                    styles.timelineBar,
                                                                    { backgroundColor: leftBarActiveColor },
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
                                                                    // right bar uses same logic as "left" of next node
                                                                    { backgroundColor: leftBarActiveColor },
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
                            );
                        })()}

                        {/* Keep the textual history below, so nothing is lost */}
                        <Text style={[styles.sectionLabel, { marginTop: 12 }]}>History:</Text>
                        {bilty.statusHistory.map((entry, index) => (
                            <View key={index} style={styles.historyItem}>
                                <Text style={styles.historyStatus}>{entry.status}</Text>
                                {entry.note ? (
                                    <Text style={styles.bodyText}>Note: {entry.note}</Text>
                                ) : null}
                            </View>
                        ))}
                    </Card.Content>
                </Card>


                {/* Goods */}
                <Card style={styles.sectionCard}>
                    <Card.Title title="Goods" />
                    <Card.Content>
                        <Text style={styles.bodyText}>
                            Description: {bilty.goodsDescription}
                        </Text>
                        <Text style={styles.bodyText}>
                            No. of Packages: {bilty.noOfPackages}
                        </Text>
                        <Text style={styles.bodyText}>
                            Total Weight: {bilty.totalWeightKg} kg
                        </Text>
                    </Card.Content>
                </Card>

                {/* Charges */}
                <Card style={styles.sectionCard}>
                    <Card.Title title="Charges" />
                    <Card.Content>
                        <Text style={styles.bodyText}>
                            Freight: ₹{bilty.freightAmount}
                        </Text>
                        <Text style={styles.bodyText}>
                            Other Charges: ₹{bilty.otherCharges ?? 0}
                        </Text>
                        <Text style={styles.bodyText}>
                            GST: ₹{bilty.gstAmount ?? 0}
                        </Text>
                        <Text style={styles.totalText}>
                            Total: ₹{bilty.totalAmount}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Status */}
                <Card style={styles.sectionCard}>
                    <Card.Title title="Status" />
                    <Card.Content>
                        <Text style={styles.bodyText}>Current: {statusLabel}</Text>
                        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
                            History:
                        </Text>
                        {bilty.statusHistory.map((entry, index) => (
                            <View key={index} style={styles.historyItem}>
                                <Text style={styles.historyStatus}>{entry.status}</Text>
                                {entry.note ? (
                                    <Text style={styles.bodyText}>Note: {entry.note}</Text>
                                ) : null}
                            </View>
                        ))}
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
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionBtn: {
        flex: 1,
        marginHorizontal: 4,
    },
    fullWidthBtn: {
        flex: 1,
    },
    sectionCard: {
        marginTop: 12,
        borderRadius: 20,
        backgroundColor: colors.surfaceSoft,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMain,
        marginTop: 4,
    },
    boldText: {
        fontWeight: '600',
        color: colors.textMain,
    },
    bodyText: {
        fontSize: 13,
        color: colors.textMain,
        marginTop: 2,
    },
    totalText: {
        marginTop: 6,
        fontWeight: '700',
        color: colors.textMain,
    },
    sectionSpacer: {
        height: 10,
    },
    historyItem: {
        marginTop: 4,
        paddingVertical: 2,
    },
    historyStatus: {
        fontWeight: '600',
        color: colors.textMain,
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
