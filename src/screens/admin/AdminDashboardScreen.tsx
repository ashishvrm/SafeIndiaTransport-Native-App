import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

interface AdminDashboardScreenProps {
  onLogout?: () => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onLogout,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>
        This is where we&apos;ll show today&apos;s bilties, stats, etc.
      </Text>

      <Button title="Logout" onPress={onLogout} />
    </View>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
});
