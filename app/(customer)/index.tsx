import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function CustomerDashboardScreen() {
  const { signOutUser, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error('[CustomerDashboard] signOut error', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Dashboard</Text>
      {user?.email && (
        <Text style={styles.subtitle}>Welcome, {user.email}</Text>
      )}

      <View style={styles.actions}>
        <Link href="/(customer)/bilties" asChild>
          <Button title="View My Bilties" />
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
