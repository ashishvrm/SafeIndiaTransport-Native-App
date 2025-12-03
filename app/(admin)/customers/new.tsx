import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { createCustomerAccount, NewCustomerInput } from '../../../src/data/partiesRepository';
import { colors } from '../../../src/theme/colors';

export default function NewCustomerScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!name.trim()) {
        setError('Customer name is required.');
        return;
      }

      const input: NewCustomerInput = {
        name,
        contactPerson,
        phone,
        email,
        gstin,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      };

      const id = await createCustomerAccount(input);

      Alert.alert('Success', 'Customer created successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(admin)/customers' as any);
          },
        },
      ]);
    } catch (e: any) {
      console.error('[NewCustomer] Error creating customer', e);
      setError(e?.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>New Customer</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text style={styles.label}>Contact Person</Text>
        <TextInput
          value={contactPerson}
          onChangeText={setContactPerson}
          style={styles.input}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.label}>GSTIN</Text>
        <TextInput
          value={gstin}
          onChangeText={setGstin}
          style={styles.input}
        />

        <Text style={styles.label}>Address Line 1</Text>
        <TextInput
          value={addressLine1}
          onChangeText={setAddressLine1}
          style={styles.input}
        />

        <Text style={styles.label}>Address Line 2</Text>
        <TextInput
          value={addressLine2}
          onChangeText={setAddressLine2}
          style={styles.input}
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          value={state}
          onChangeText={setState}
          style={styles.input}
        />

        <Text style={styles.label}>Pincode</Text>
        <TextInput
          value={pincode}
          onChangeText={setPincode}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          {saving ? (
            <Text>Saving…</Text>
          ) : (
            <Button title="Create Customer" onPress={handleSave} />
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
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
  buttonContainer: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
