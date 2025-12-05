import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { fetchBiltiesForConsignee } from '../../../src/data/biltiesRepository';
import { deactivateCustomerAccount, fetchCustomerParties, } from '../../../src/data/partiesRepository';
import type { Party } from '../../../src/models/party';
import { colors } from '../../../src/theme/colors';

export default function CustomersListScreen() {
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
            // Check if customer has any bilties
            const bilties = await fetchBiltiesForConsignee(customer.id);

            if (bilties.length > 0) {
                // Customer in use: only deactivate, keep data for historic bilties
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
                                    console.error('[CustomersList] Deactivate customer error', e);
                                    Alert.alert('Error', 'Failed to deactivate customer.');
                                }
                            },
                        },
                    ],
                );
                return;
            }

            // No bilties: safe to just deactivate (effectively delete from UI)
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

    const renderItem = ({ item }: { item: Party }) => (
        <TouchableOpacity style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {item.city && item.state && (
                <Text style={styles.subtitle}>
                    {item.city}, {item.state}
                </Text>
            )}
            {item.gstin && <Text style={styles.small}>GSTIN: {item.gstin}</Text>}
            <View style={styles.cardActions}>
                <Link
                    href={{
                        pathname: '/(admin)/customers/[id]/bilties',
                        params: { id: item.id },
                    }}
                    asChild
                >
                    <Button title="View Bilties" />
                </Link>
                <View style={{ height: 8 }} />

                <Button
                    title="Delete Customer"
                    onPress={() => handleDeleteCustomer(item)}
                />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.infoText}>Loading customers…</Text>
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
            <View style={styles.headerRow}>
                <Text style={styles.title}>Customers</Text>
                <Link href="/(admin)/customers/new" asChild>
                    <Button title="Add Customer" />
                </Link>
            </View>

            <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.infoText}>No customers yet.</Text>
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
    card: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        marginBottom: 12,
        backgroundColor: colors.surface,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textMain,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
        color: colors.textSubtle,
    },
    small: {
        fontSize: 12,
        marginTop: 2,
        color: colors.textSubtle,
    },
    cardActions: {
        marginTop: 8,
    },
});
