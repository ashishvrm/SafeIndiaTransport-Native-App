import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function AdminDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>
        Placeholder – here we’ll later show today&apos;s bilties, in-transit, delivered, etc.
      </Text>

      <View style={styles.actions}>
        <Link href="/(admin)/bilties" asChild>
          <Button title="View all Bilties" />
        </Link>
        {/* Later: add buttons for New Bilty, Vehicles, Drivers, etc. */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
});
