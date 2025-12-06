import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { fetchAllParties } from '../../../src/data/partiesRepository';
import type { Party } from '../../../src/models/party';

import {
    Alert,
    Button,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { createBilty, NewBiltyInput } from '../../../src/data/biltiesRepository';
import { colors } from '../../../src/theme/colors';

export default function NewBiltyScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const { consigneeId: consigneeParam } = useLocalSearchParams<{
        consigneeId?: string;
    }>();
    const [consignorId, setConsignorId] = useState('');
    const [consigneeId, setConsigneeId] = useState('');
    const [origin, setOrigin] = useState('Delhi');
    const [destination, setDestination] = useState('Mumbai');
    const [goodsDescription, setGoodsDescription] = useState('General goods');
    const [noOfPackages, setNoOfPackages] = useState('1');
    const [totalWeightKg, setTotalWeightKg] = useState('100');
    const [freightAmount, setFreightAmount] = useState('0');
    const [otherCharges, setOtherCharges] = useState('0');
    const [gstAmount, setGstAmount] = useState('0');
    const [paymentType, setPaymentType] = useState<'to_pay' | 'paid' | 'to_be_billed'>('to_pay');
    const [vehicleId, setVehicleId] = useState('');
    const [driverId, setDriverId] = useState('');
    const [parties, setParties] = useState<Party[]>([]);
    const [partiesLoading, setPartiesLoading] = useState<boolean>(true);
    const [partiesError, setPartiesError] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [consigneePrefilled, setConsigneePrefilled] = useState(false);

    const [consignorMenuVisible, setConsignorMenuVisible] = useState(false);
    const [consigneeMenuVisible, setConsigneeMenuVisible] = useState(false);

    if (!user) {
        return (
            <View style={styles.center}>
                <Text>You must be logged in as admin to create a bilty.</Text>
            </View>
        );
    }

    // Load parties on mount
    useEffect(() => {
        const loadParties = async () => {
            try {
                setPartiesLoading(true);
                setPartiesError(null);
                const data = await fetchAllParties();
                setParties(data);
            } catch (e: any) {
                console.error('[NewBilty] Error loading parties', e);
                setPartiesError(e?.message || 'Failed to load parties');
            } finally {
                setPartiesLoading(false);
            }
        };

        loadParties();
    }, []);

    // Prefill consignee if passed via params
    useEffect(() => {
        if (
            !consigneePrefilled &&
            consigneeParam &&
            typeof consigneeParam === 'string' &&
            parties.length > 0
        ) {
            const match = parties.find((p) => p.id === consigneeParam);
            if (match) {
                setConsigneeId(match.id);
                setConsigneePrefilled(true);
            }
        }
    }, [consigneePrefilled, consigneeParam, parties]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            if (!origin.trim() || !destination.trim() || !goodsDescription.trim()) {
                setError('Origin, Destination, and Goods Description are required.');
                return;
            }

            if (!consignorId || !consigneeId) {
                setError('Please select both consignor and consignee.');
                return;
            }

            const parsedNoOfPackages = parseInt(noOfPackages, 10);
            const parsedTotalWeight = parseFloat(totalWeightKg);
            const parsedFreight = parseFloat(freightAmount);
            const parsedOther = parseFloat(otherCharges || '0');
            const parsedGst = parseFloat(gstAmount || '0');

            if (isNaN(parsedNoOfPackages) || isNaN(parsedTotalWeight) || isNaN(parsedFreight)) {
                setError('Packages, weight, and freight must be valid numbers.');
                return;
            }

            const input: NewBiltyInput = {
                consignorId: consignorId.trim(),
                consigneeId: consigneeId.trim(),
                origin: origin.trim(),
                destination: destination.trim(),
                goodsDescription: goodsDescription.trim(),
                noOfPackages: parsedNoOfPackages,
                totalWeightKg: parsedTotalWeight,
                freightAmount: parsedFreight,
                otherCharges: isNaN(parsedOther) ? 0 : parsedOther,
                gstAmount: isNaN(parsedGst) ? 0 : parsedGst,
                paymentType,
                vehicleId: vehicleId.trim() || undefined,
                driverId: driverId.trim() || undefined,
                createdBy: user.uid,
            };

            const newId = await createBilty(input);

            Alert.alert('Success', `Bilty created successfully (ID: ${newId})`, [
                {
                    text: 'OK',
                    onPress: () => {
                        router.replace('/(admin)/bilties');
                    },
                },
            ]);
        } catch (e: any) {
            console.error('[NewBilty] Error creating bilty', e);
            setError(e?.message || 'Failed to create bilty');
        } finally {
            setSaving(false);
        }
    };

    const totalAmount =
        (parseFloat(freightAmount || '0') || 0) +
        (parseFloat(otherCharges || '0') || 0) +
        (parseFloat(gstAmount || '0') || 0);

    const getPartyName = (id: string): string => {
        const p = parties.find((x) => x.id === id);
        return p ? p.name : id;
    };

    const consignorLabel = consignorId ? getPartyName(consignorId) : 'Select consignor';
    const consigneeLabel = consigneeId ? getPartyName(consigneeId) : 'Select consignee';

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.title}>New Bilty</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <Text style={styles.sectionTitle}>Parties</Text>

                {partiesLoading && (
                    <Text style={styles.infoText}>Loading parties…</Text>
                )}
                {partiesError && (
                    <Text style={[styles.infoText, { color: 'red' }]}>{partiesError}</Text>
                )}

                {/* Consignor dropdown */}
                <Text style={styles.label}>Consignor</Text>
                <Menu
                    visible={consignorMenuVisible}
                    onDismiss={() => setConsignorMenuVisible(false)}
                    anchor={
                        <TouchableOpacity
                            onPress={() => setConsignorMenuVisible(true)}
                            style={styles.selectorBox}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.selectorValue}>{consignorLabel}</Text>
                        </TouchableOpacity>
                    }
                >
                    {parties
                        .filter((p) => p.isActive && (p.type === 'consignor' || p.type === 'both'))
                        .map((p) => (
                            <Menu.Item
                                key={p.id}
                                onPress={() => {
                                    setConsignorId(p.id);
                                    setConsignorMenuVisible(false);
                                }}
                                title={p.name}
                            />
                        ))}
                </Menu>

                {/* Consignee dropdown */}
                <Text style={styles.label}>Consignee</Text>
                <Menu
                    visible={consigneeMenuVisible}
                    onDismiss={() => setConsigneeMenuVisible(false)}
                    anchor={
                        <TouchableOpacity
                            onPress={() => setConsigneeMenuVisible(true)}
                            style={styles.selectorBox}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.selectorValue}>{consigneeLabel}</Text>
                        </TouchableOpacity>
                    }
                >
                    {parties
                        .filter((p) => p.isActive && (p.type === 'consignee' || p.type === 'both'))
                        .map((p) => (
                            <Menu.Item
                                key={p.id}
                                onPress={() => {
                                    setConsigneeId(p.id);
                                    setConsigneeMenuVisible(false);
                                }}
                                title={p.name}
                            />
                        ))}
                </Menu>


                <Text style={styles.sectionTitle}>Route</Text>
                <Text style={styles.label}>Origin</Text>
                <TextInput
                    value={origin}
                    onChangeText={setOrigin}
                    style={styles.input}
                />

                <Text style={styles.label}>Destination</Text>
                <TextInput
                    value={destination}
                    onChangeText={setDestination}
                    style={styles.input}
                />

                <Text style={styles.sectionTitle}>Goods</Text>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    value={goodsDescription}
                    onChangeText={setGoodsDescription}
                    style={styles.input}
                />

                <Text style={styles.label}>No. of Packages</Text>
                <TextInput
                    value={noOfPackages}
                    onChangeText={setNoOfPackages}
                    keyboardType="numeric"
                    style={styles.input}
                />

                <Text style={styles.label}>Total Weight (kg)</Text>
                <TextInput
                    value={totalWeightKg}
                    onChangeText={setTotalWeightKg}
                    keyboardType="numeric"
                    style={styles.input}
                />

                <Text style={styles.sectionTitle}>Charges</Text>
                <Text style={styles.label}>Freight Amount (₹)</Text>
                <TextInput
                    value={freightAmount}
                    onChangeText={setFreightAmount}
                    keyboardType="numeric"
                    style={styles.input}
                />

                <Text style={styles.label}>Other Charges (₹)</Text>
                <TextInput
                    value={otherCharges}
                    onChangeText={setOtherCharges}
                    keyboardType="numeric"
                    style={styles.input}
                />

                <Text style={styles.label}>GST Amount (₹)</Text>
                <TextInput
                    value={gstAmount}
                    onChangeText={setGstAmount}
                    keyboardType="numeric"
                    style={styles.input}
                />

                <Text style={styles.totalText}>Total: ₹{totalAmount || 0}</Text>

                <Text style={styles.sectionTitle}>Payment & Vehicle</Text>
                <Text style={styles.label}>Payment Type (to_pay / paid / to_be_billed)</Text>
                <TextInput
                    value={paymentType}
                    onChangeText={(txt) =>
                        setPaymentType(
                            (txt as 'to_pay' | 'paid' | 'to_be_billed') || 'to_pay',
                        )
                    }
                    style={styles.input}
                />

                <Text style={styles.label}>Vehicle ID (optional)</Text>
                <TextInput
                    value={vehicleId}
                    onChangeText={setVehicleId}
                    style={styles.input}
                />

                <Text style={styles.label}>Driver ID (optional)</Text>
                <TextInput
                    value={driverId}
                    onChangeText={setDriverId}
                    style={styles.input}
                />

                <View style={styles.buttonContainer}>
                    {saving ? (
                        <Text>Saving…</Text>
                    ) : (
                        <Button title="Create Bilty" onPress={handleSave} />
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: colors.background,
    },
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
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        color: colors.textMain,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 4,
        color: colors.textMain,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: colors.textSubtle,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        backgroundColor: colors.surface,
    },
    totalText: {
        marginTop: 8,
        fontWeight: '700',
        color: colors.textMain,
    },
    buttonContainer: {
        marginTop: 16,
    },
    error: {
        color: 'red',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: colors.textSubtle,
        marginBottom: 4,
    },
    selectorBox: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        backgroundColor: colors.surface,
    },
    selectorValue: {
        fontSize: 14,
        color: colors.textMain,
    },
    partyListRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    partyChip: {
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
    partyChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryDark,
        color: '#ffffff',
    },
});
