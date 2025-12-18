import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
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
    const [consignorName, setConsignorName] = useState('');
    const [consigneeId, setConsigneeId] = useState('');
    const [consigneeName, setConsigneeName] = useState('');
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
    const [consignorSuggestions, setConsignorSuggestions] = useState<Party[]>([]);
    const [consigneeMenuVisible, setConsigneeMenuVisible] = useState(false);
    const [consigneeSuggestions, setConsigneeSuggestions] = useState<Party[]>([]);

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
                setConsigneeName(match.name);
                setConsigneePrefilled(true);
            }
        }
    }, [consigneePrefilled, consigneeParam, parties]);

    const handleConsignorChange = (text: string) => {
        setConsignorName(text);
        setConsignorId(''); // Clear the ID when user types

        if (text.trim().length > 0) {
            // Filter parties that match the input
            const filtered = parties
                .filter((p) => 
                    p.isActive && 
                    (p.type === 'consignor' || p.type === 'both') &&
                    p.name.toLowerCase().includes(text.toLowerCase())
                )
                .slice(0, 5); // Limit to 5 suggestions
            
            setConsignorSuggestions(filtered);
            setConsignorMenuVisible(filtered.length > 0);
        } else {
            setConsignorSuggestions([]);
            setConsignorMenuVisible(false);
        }
    };

    const selectConsignor = (party: Party) => {
        setConsignorId(party.id);
        setConsignorName(party.name);
        setConsignorMenuVisible(false);
        setConsignorSuggestions([]);
    };

    const handleConsigneeChange = (text: string) => {
        // Don't allow changes if consignee is pre-filled from customer page
        if (consigneeParam) {
            return;
        }

        setConsigneeName(text);
        setConsigneeId(''); // Clear the ID when user types

        if (text.trim().length > 0) {
            // Filter parties that match the input
            const filtered = parties
                .filter((p) => 
                    p.isActive && 
                    (p.type === 'consignee' || p.type === 'both') &&
                    p.name.toLowerCase().includes(text.toLowerCase())
                )
                .slice(0, 5); // Limit to 5 suggestions
            
            setConsigneeSuggestions(filtered);
            setConsigneeMenuVisible(filtered.length > 0);
        } else {
            setConsigneeSuggestions([]);
            setConsigneeMenuVisible(false);
        }
    };

    const selectConsignee = (party: Party) => {
        // Don't allow selection if consignee is pre-filled from customer page
        if (consigneeParam) {
            return;
        }

        setConsigneeId(party.id);
        setConsigneeName(party.name);
        setConsigneeMenuVisible(false);
        setConsigneeSuggestions([]);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            if (!origin.trim() || !destination.trim() || !goodsDescription.trim()) {
                setError('Origin, Destination, and Goods Description are required.');
                return;
            }

            // Validation: Consignee must be selected (not free-form)
            if (!consigneeId.trim()) {
                setError('Please select a consignee from the customer list.');
                return;
            }

            // Consignor can be free-form or selected
            const finalConsignorId = consignorId.trim() || consignorName.trim();
            if (!finalConsignorId) {
                setError('Please enter consignor name.');
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
                consignorId: finalConsignorId,
                consigneeId: consigneeId.trim(), // Always use the actual party ID
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
                createdBy: user?.uid || '',
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

    if (!user) {
        return (
            <View style={styles.center}>
                <Text>You must be logged in as admin to create a bilty.</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.title}>New Bilty</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                {/* Show customer info banner when creating from customer page */}
                {consigneeParam && consigneeName && (
                    <View style={styles.customerBanner}>
                        <Text style={styles.customerBannerLabel}>Creating bilty for customer:</Text>
                        <Text style={styles.customerBannerName}>{consigneeName}</Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Parties</Text>

                {partiesLoading && (
                    <Text style={styles.infoText}>Loading parties…</Text>
                )}
                {partiesError && (
                    <Text style={[styles.infoText, { color: 'red' }]}>{partiesError}</Text>
                )}

                {/* Consignor autocomplete input */}
                <Text style={styles.label}>Consignor</Text>
                <View style={styles.autocompleteWrapper}>
                    <TextInput
                        style={styles.input}
                        value={consignorName}
                        onChangeText={handleConsignorChange}
                        placeholder="Type consignor name..."
                        autoCapitalize="words"
                    />
                    {consignorMenuVisible && consignorSuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            {consignorSuggestions.map((p) => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={styles.suggestionItem}
                                    onPress={() => selectConsignor(p)}
                                >
                                    <Text style={styles.suggestionText}>{p.name}</Text>
                                    {p.city && p.state && (
                                        <Text style={styles.suggestionSubtext}>
                                            {p.city}, {p.state}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Consignee autocomplete input */}
                <Text style={styles.label}>Consignee</Text>
                <View style={styles.autocompleteWrapper}>
                    <TextInput
                        style={[styles.input, consigneeParam && styles.inputDisabled]}
                        value={consigneeName}
                        onChangeText={handleConsigneeChange}
                        placeholder="Type consignee name..."
                        autoCapitalize="words"
                        editable={!consigneeParam}
                    />
                    {consigneeMenuVisible && consigneeSuggestions.length > 0 && !consigneeParam && (
                        <View style={styles.suggestionsContainer}>
                            {consigneeSuggestions.map((p) => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={styles.suggestionItem}
                                    onPress={() => selectConsignee(p)}
                                >
                                    <Text style={styles.suggestionText}>{p.name}</Text>
                                    {p.city && p.state && (
                                        <Text style={styles.suggestionSubtext}>
                                            {p.city}, {p.state}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>


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
    autocompleteWrapper: {
        position: 'relative',
        zIndex: 1000,
        marginBottom: 8,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1001,
    },
    suggestionItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    suggestionText: {
        fontSize: 14,
        color: colors.textMain,
        fontWeight: '500',
    },
    suggestionSubtext: {
        fontSize: 12,
        color: colors.textSubtle,
        marginTop: 2,
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
    customerBanner: {
        backgroundColor: colors.softBlue,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    customerBannerLabel: {
        fontSize: 12,
        color: colors.textSubtle,
        marginBottom: 4,
    },
    customerBannerName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textMain,
    },
    inputDisabled: {
        backgroundColor: colors.background,
        opacity: 0.7,
    },
});
