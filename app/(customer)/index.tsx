import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function CustomerDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Dashboard</Text>
      <Text style={styles.subtitle}>
        Placeholder – here we’ll show active consignments and recent deliveries.
      </Text>

      <View style={styles.actions}>
        <Link href="/(customer)/bilties" asChild>
          <Button title="View My Bilties" />
        </Link>
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
