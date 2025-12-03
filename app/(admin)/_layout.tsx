import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function AdminLayout() {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.text}>Checking admin access…</Text>
            </View>
        );
    }

    if (!user || role !== 'admin') {
        return <Redirect href="/(auth)/login" />;
    }

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
                name="bilties/new"
                options={{ title: 'New Bilty' }}
            />
            <Stack.Screen
                name="bilties/[id]"
                options={{ title: 'Bilty Details (Admin)' }}
            />
        </Stack>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 8,
        fontSize: 12,
        color: colors.textSubtle,
    },
});
