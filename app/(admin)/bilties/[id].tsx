import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { deleteBilty, fetchBiltyById } from '../../../src/data/biltiesRepository';
import { fetchPartyById } from '../../../src/data/partiesRepository';
import type { Bilty } from '../../../src/models/bilty';
import type { Party } from '../../../src/models/party';
import { colors } from '../../../src/theme/colors';

export default function AdminBiltyDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [bilty, setBilty] = useState<Bilty | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [consignor, setConsignor] = useState<Party | null>(null);
    const [consignee, setConsignee] = useState<Party | null>(null);
    const [partyLoading, setPartyLoading] = useState<boolean>(false);
    const router = useRouter();
    const handleShare = async () => {
        if (!bilty) return;

        const consignorName = consignor?.name ?? bilty.consignorId;
        const consigneeName = consignee?.name ?? bilty.consigneeId;

        const lines = [
            `Bilty No: ${bilty.biltyNumber}`,
            `Route: ${bilty.origin} → ${bilty.destination}`,
            '',
            `Consignor: ${consignorName}`,
            consignor?.city && consignor?.state ? `  ${consignor.city}, ${consignor.state}` : '',
            consignor?.gstin ? `  GSTIN: ${consignor.gstin}` : '',
            '',
            `Consignee: ${consigneeName}`,
            consignee?.city && consignee?.state ? `  ${consignee.city}, ${consignee.state}` : '',
            consignee?.gstin ? `  GSTIN: ${consignee.gstin}` : '',
            '',
            `Goods: ${bilty.goodsDescription}`,
            `Packages: ${bilty.noOfPackages}, Weight: ${bilty.totalWeightKg} kg`,
            '',
            `Charges:`,
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
            router.replace('/(admin)/bilties'); // back to all bilties
          } catch (e) {
            console.error('[AdminBiltyDetail] Delete error', e);
            Alert.alert('Error', 'Failed to delete bilty. Please try again.');
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
            <View style={styles.shareRow}>
                <Button title="Share Bilty" onPress={handleShare} />
            </View>

            <View style={styles.actionsRow}>
            <Button
                title="Edit Bilty"
                onPress={() => {
                if (id) {
                    router.push(`/(admin)/bilties/${id}/edit`);
                }
                }}
            />
            </View>

            <View style={styles.actionsRow}>
            <Button title="Delete Bilty" onPress={handleDelete} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Parties</Text>
                {partyLoading && (
                    <Text style={styles.infoText}>Loading party details…</Text>
                )}

                <Text style={styles.label}>Consignor</Text>
                <Text>{consignor?.name ?? bilty.consignorId}</Text>
                {consignor && (
                    <>
                        {consignor.city && consignor.state && (
                            <Text>
                                {consignor.city}, {consignor.state}
                            </Text>
                        )}
                        {consignor.gstin && <Text>GSTIN: {consignor.gstin}</Text>}
                    </>
                )}

                <Text style={styles.label}>Consignee</Text>
                <Text>{consignee?.name ?? bilty.consigneeId}</Text>
                {consignee && (
                    <>
                        {consignee.city && consignee.state && (
                            <Text>
                                {consignee.city}, {consignee.state}
                            </Text>
                        )}
                        {consignee.gstin && <Text>GSTIN: {consignee.gstin}</Text>}
                    </>
                )}
            </View>

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
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSubtle,
        marginTop: 4,
    },
    shareRow: {
        marginTop: 8,
        marginBottom: 12,
    },
    actionsRow: {
        marginTop: 8,
        marginBottom: 12,
    },
});
