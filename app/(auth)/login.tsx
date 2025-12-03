import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { db } from '../../src/config/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

export default function LoginScreen() {
  const { user, role, loading: authLoading, signIn } = useAuth();

  const [firebaseStatus, setFirebaseStatus] =
    useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [firebaseMessage, setFirebaseMessage] = useState<string>('');

  const [email, setEmail] = useState<string>('admin@test.com'); // default for easier testing
  const [password, setPassword] = useState<string>('Admin123!');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError(null);
      await signIn(email.trim(), password);
      // Auth state + router redirects will take over
    } catch (error: any) {
      console.error('[Login] signIn error', error);
      setLoginError(error?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.inner}>
        <Text style={styles.appTitle}>Transport Logistics App</Text>
        <Text style={styles.subtitle}>Login</Text>

        {/* Firebase connection status */}
        {firebaseStatus === 'checking' && (
          <View style={styles.firebaseStatus}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.firebaseText}>Checking Firebase…</Text>
          </View>
        )}
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

        {/* Auth state (debug) */}
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

        {/* Login form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            style={styles.input}
          />

          {loginError && (
            <Text style={[styles.errorText]}>{loginError}</Text>
          )}

          <View style={styles.buttonContainer}>
            {loginLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Button title="Login" onPress={handleLogin} />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: colors.textSubtle,
  },
  firebaseStatus: {
    marginBottom: 8,
    alignItems: 'center',
  },
  firebaseText: {
    marginTop: 4,
    fontSize: 12,
  },
  authState: {
    marginBottom: 16,
  },
  authText: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  form: {
    width: '100%',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textMain,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 4,
  },
});
