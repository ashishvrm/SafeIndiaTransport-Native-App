// src/screens/auth/LoginScreen.tsx
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

interface LoginScreenProps {
  onMockLoginAsAdmin?: () => void;
  onMockLoginAsCustomer?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onMockLoginAsAdmin,
  onMockLoginAsCustomer,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transport App Login</Text>
      <Text style={styles.subtitle}>
        (Firebase auth will come later – this is a placeholder)
      </Text>

      <View style={styles.buttonGroup}>
        <Button title="Login as Admin (mock)" onPress={onMockLoginAsAdmin} />
      </View>

      <View style={styles.buttonGroup}>
        <Button
          title="Login as Customer (mock)"
          onPress={onMockLoginAsCustomer}
        />
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  buttonGroup: {
    width: '100%',
    marginVertical: 6,
  },
});
