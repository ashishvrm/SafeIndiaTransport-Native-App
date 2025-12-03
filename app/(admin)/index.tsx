import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function AdminDashboardScreen() {
  const { signOutUser, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error('[AdminDashboard] signOut error', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      {user?.email && (
        <Text style={styles.subtitle}>Welcome, {user.email}</Text>
      )}
      <View style={styles.actions}>
        <Link href="/(admin)/bilties" asChild>
          <Button title="View all Bilties" />
        </Link>
        <Link href="/(admin)/bilties/new" asChild>
          <Button title="Create New Bilty" />
        </Link>
        <Link href="/(admin)/customers" asChild>
          <Button title="View all Customers" />
        </Link>
      </View>

      <View style={styles.footer}>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSubtle,
    marginBottom: 16,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  footer: {
    marginTop: 32,
  },
});
