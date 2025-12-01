import { useAuth } from '@/src/context/AuthContext';
import { Link } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { db } from '../../src/config/firebase';
import { colors } from '../../src/theme/colors';

export default function LoginScreen() {
  const { user, role, loading: authLoading } = useAuth();

  const [firebaseStatus, setFirebaseStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [firebaseMessage, setFirebaseMessage] = useState<string>('');

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        setFirebaseStatus('checking');
        setFirebaseMessage('');

        const metaDocRef = doc(db, 'meta', 'connection-test');
        const snapshot = await getDoc(metaDocRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as { message?: string };
          const msg = data.message || 'Connected to Firestore';
          setFirebaseStatus('ok');
          setFirebaseMessage(msg);
          console.log('[Firebase] connection-test message:', msg);
        } else {
          setFirebaseStatus('error');
          setFirebaseMessage('Doc meta/connection-test not found');
        }
      } catch (error: any) {
        console.error('[Firebase] Error checking connection:', error);
        setFirebaseStatus('error');
        setFirebaseMessage(error?.message || 'Unknown error');
      }
    };

    checkFirebase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Transport Logistics App</Text>
      <Text style={styles.subtitle}>Login (placeholder)</Text>

      {/* Firebase connection status */}
      {firebaseStatus === 'checking' && (
        <View style={styles.firebaseStatus}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.firebaseText}>Checking Firebase…</Text>
        </View>
      )}
      <View style={styles.authState}>
        {authLoading ? (
          <Text style={styles.authText}>Checking auth…</Text>
        ) : user ? (
          <Text style={styles.authText}>
            Logged in as {user.email} ({role ?? 'no-role'})
          </Text>
        ) : (
          <Text style={styles.authText}>Not logged in</Text>
        )}
      </View>
      {firebaseStatus === 'ok' && (
        <View style={styles.firebaseStatus}>
          <Text style={[styles.firebaseText, { color: colors.primary }]}>
            Firebase OK: {firebaseMessage || 'Connected'}
          </Text>
        </View>
      )}
      {firebaseStatus === 'error' && (
        <View style={styles.firebaseStatus}>
          <Text style={[styles.firebaseText, { color: 'red' }]}>
            Firebase error: {firebaseMessage || 'Check config'}
          </Text>
        </View>
      )}

      <View style={styles.links}>
        <Text style={styles.sectionLabel}>Quick nav (dev only):</Text>
        <Link href="/(admin)/" asChild>
          <Button title="Go to Admin Dashboard" />
        </Link>
        <Link href="/(customer)/" asChild>
          <Button title="Go to Customer Dashboard" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: colors.textSubtle,
  },
  links: {
    gap: 12,
    width: '100%',
    marginTop: 16,
  },
  sectionLabel: {
    marginBottom: 8,
    color: colors.textSubtle,
  },
  firebaseStatus: {
    marginBottom: 16,
    alignItems: 'center',
  },
  firebaseText: {
    marginTop: 4,
    fontSize: 12,
  },
  authState: {
    marginBottom: 12,
  },
  authText: {
    fontSize: 12,
    color: colors.textSubtle,
  },
});
