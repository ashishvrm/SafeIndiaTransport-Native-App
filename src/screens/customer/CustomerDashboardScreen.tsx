import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

interface CustomerDashboardScreenProps {
  onLogout?: () => void;
}

const CustomerDashboardScreen: React.FC<CustomerDashboardScreenProps> = ({
  onLogout,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Dashboard</Text>
      <Text style={styles.subtitle}>
        This is where customers will see their consignments and status.
      </Text>

      <Button title="Logout" onPress={onLogout} />
    </View>
  );
};

export default CustomerDashboardScreen;

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
