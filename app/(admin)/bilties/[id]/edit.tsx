import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../../../src/context/AuthContext';
import { EditableBiltyFields, fetchBiltyById, updateBilty } from '../../../../src/data/biltiesRepository';
import { fetchAllParties } from '../../../../src/data/partiesRepository';
import type { Bilty, BiltyStatus } from '../../../../src/models/bilty';
import type { Party } from '../../../../src/models/party';
import { colors } from '../../../../src/theme/colors';

export default function EditBiltyScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [bilty, setBilty] = useState<Bilty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [parties, setParties] = useState<Party[]>([]);
  const [partiesLoading, setPartiesLoading] = useState<boolean>(true);
  const [partiesError, setPartiesError] = useState<string | null>(null);

  const [consignorId, setConsignorId] = useState('');
  const [consigneeId, setConsigneeId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [goodsDescription, setGoodsDescription] = useState('');
  const [noOfPackages, setNoOfPackages] = useState('');
  const [totalWeightKg, setTotalWeightKg] = useState('');
  const [freightAmount, setFreightAmount] = useState('');
  const [otherCharges, setOtherCharges] = useState('');
  const [gstAmount, setGstAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'to_pay' | 'paid' | 'to_be_billed'>('to_pay');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [status, setStatus] = useState<BiltyStatus>('created');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchBiltyById(String(id));
        if (!data) {
          setError('Bilty not found');
          return;
        }
        setBilty(data);

        // Pre-fill fields from bilty
        setConsignorId(data.consignorId);
        setConsigneeId(data.consigneeId);
        setOrigin(data.origin);
        setDestination(data.destination);
        setGoodsDescription(data.goodsDescription);
        setNoOfPackages(String(data.noOfPackages));
        setTotalWeightKg(String(data.totalWeightKg));
        setFreightAmount(String(data.freightAmount));
        setOtherCharges(String(data.otherCharges ?? 0));
        setGstAmount(String(data.gstAmount ?? 0));
        setPaymentType(data.paymentType);
        setVehicleId(data.vehicleId ?? '');
        setDriverId(data.driverId ?? '');
        setStatus(data.status);
      } catch (e: any) {
        console.error('[EditBilty] Error loading bilty', e);
        setError(e?.message || 'Failed to load bilty');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadParties = async () => {
      try {
        setPartiesLoading(true);
        setPartiesError(null);
        const data = await fetchAllParties();
        setParties(data);
      } catch (e: any) {
        console.error('[EditBilty] Error loading parties', e);
        setPartiesError(e?.message || 'Failed to load parties');
      } finally {
        setPartiesLoading(false);
      }
    };
    loadParties();
  }, []);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>You must be logged in as admin to edit a bilty.</Text>
      </View>
    );
  }

  if (loading && !bilty) {
    return (
      <View style={styles.center}>
        <Text>Loading bilty…</Text>
      </View>
    );
  }

  if (error && !bilty) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  const getPartyName = (partyId: string): string => {
    const p = parties.find((x) => x.id === partyId);
    return p ? p.name : partyId;
  };

  const consignorLabel = consignorId ? getPartyName(consignorId) : 'Select consignor';
  const consigneeLabel = consigneeId ? getPartyName(consigneeId) : 'Select consignee';

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

      const fields: EditableBiltyFields = {
        consignorId,
        consigneeId,
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
        status,
      };

      await updateBilty(String(id), fields);

      Alert.alert('Success', 'Bilty updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.replace(`/(admin)/bilties/${id}`);
          },
        },
      ]);
    } catch (e: any) {
      console.error('[EditBilty] Error updating bilty', e);
      setError(e?.message || 'Failed to update bilty');
    } finally {
      setSaving(false);
    }
  };

  const totalAmount =
    (parseFloat(freightAmount || '0') || 0) +
    (parseFloat(otherCharges || '0') || 0) +
    (parseFloat(gstAmount || '0') || 0);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit Bilty {bilty?.biltyNumber}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.sectionTitle}>Parties</Text>

        {partiesLoading && (
          <Text style={styles.infoText}>Loading parties…</Text>
        )}
        {partiesError && (
          <Text style={[styles.infoText, { color: 'red' }]}>
            {partiesError}
          </Text>
        )}

        <Text style={styles.label}>Consignor</Text>
        <View style={styles.selectorBox}>
          <Text style={styles.selectorValue}>{consignorLabel}</Text>
        </View>

        <View style={styles.partyListRow}>
          {parties
            .filter((p) => p.isActive && (p.type === 'consignor' || p.type === 'both'))
            .map((p) => {
              const isSelected = p.id === consignorId;
              return (
                <Text
                  key={p.id}
                  style={[
                    styles.partyChip,
                    isSelected && styles.partyChipSelected,
                  ]}
                  onPress={() => setConsignorId(p.id)}
                >
                  {p.name}
                </Text>
              );
            })}
        </View>

        <Text style={styles.label}>Consignee</Text>
        <View style={styles.selectorBox}>
          <Text style={styles.selectorValue}>{consigneeLabel}</Text>
        </View>

        <View style={styles.partyListRow}>
          {parties
            .filter((p) => p.isActive && (p.type === 'consignee' || p.type === 'both'))
            .map((p) => {
              const isSelected = p.id === consigneeId;
              return (
                <Text
                  key={p.id}
                  style={[
                    styles.partyChip,
                    isSelected && styles.partyChipSelected,
                  ]}
                  onPress={() => setConsigneeId(p.id)}
                >
                  {p.name}
                </Text>
              );
            })}
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
            setPaymentType((txt as any) || 'to_pay')
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

        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.label}>Status (created / in_transit / delivered / cancelled)</Text>
        <TextInput
          value={status}
          onChangeText={(txt) =>
            setStatus((txt as any) || 'created')
          }
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          {saving ? (
            <Text>Saving…</Text>
          ) : (
            <Button title="Save Changes" onPress={handleSave} />
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
