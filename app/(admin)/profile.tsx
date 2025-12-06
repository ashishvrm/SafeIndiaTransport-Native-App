// app/(admin)/profile.tsx
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { AdminBottomNav } from '../../src/components/AdminBottomNav';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function AdminProfileScreen() {
  const { user, signOutUser } = useAuth();

  // Local editable fields – you can later wire these to backend/AsyncStorage
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [gst, setGst] = useState<string>('');

  const handleSave = () => {
    // TODO: persist profile if/when you add backend/AsyncStorage.
    // For now we just keep it local so nothing breaks.
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header with top-right Sign Out */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Account</Text>
          <Button
            mode="text"
            onPress={signOutUser}
            textColor={colors.danger}
          >
            Sign Out
          </Button>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.sectionTitle}>Profile details</Text>

          <TextInput
            mode="outlined"
            label="User Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            mode="outlined"
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            mode="outlined"
            label="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            multiline
          />

          <TextInput
            mode="outlined"
            label="GST Number"
            value={gst}
            onChangeText={setGst}
            style={styles.input}
          />

          <View style={styles.actionsRow}>
            <Button mode="contained" onPress={handleSave}>
              Save
            </Button>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* Keep the same bottom nav on this screen */}
      <AdminBottomNav />
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  actionsRow: {
    marginTop: 8,
  },
});
