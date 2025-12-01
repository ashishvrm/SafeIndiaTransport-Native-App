import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="bilties/index"
        options={{ title: 'Bilties (Admin)' }}
      />
      <Stack.Screen
        name="bilties/[id]"
        options={{ title: 'Bilty Details (Admin)' }}
      />
    </Stack>
  );
}
