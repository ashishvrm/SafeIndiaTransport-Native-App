// app/(admin)/profile.tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';

export default function AdminProfileScreen() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGst] = useState('');

  // For now we just keep this local; later we can wire to Firestore.
  const handleSave = () => {
    // TODO: persist profile for this user (Firestore/RTDB)
    console.log('Save profile', { name, email, phone, address, gst });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Card.Title title="My Profile" />
        <Card.Content>
          <TextInput
            label="Name"
            value={name}
            mode="outlined"
            style={styles.input}
            onChangeText={setName}
          />
          <TextInput
            label="Email"
            value={email}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
          />
          <TextInput
            label="Phone Number"
            value={phone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            onChangeText={setPhone}
          />
          <TextInput
            label="Address"
            value={address}
            mode="outlined"
            style={styles.input}
            multiline
            onChangeText={setAddress}
          />
          <TextInput
            label="GST Number"
            value={gst}
            mode="outlined"
            style={styles.input}
            onChangeText={setGst}
          />
          <Button mode="contained" style={styles.button} onPress={handleSave}>
            Save
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});
