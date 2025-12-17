import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    Card,
    HelperText,
    Button as PaperButton,
    TextInput as PaperTextInput,
} from 'react-native-paper';
import { db } from '../../src/config/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [firebaseStatus, setFirebaseStatus] =
    useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [firebaseMessage, setFirebaseMessage] = useState<string>('');

  const [email, setEmail] = useState<string>('admin@test.com'); // default for easier testing
  const [password, setPassword] = useState<string>('Admin123!');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

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

  const emailError = emailTouched && !isValidEmail(email.trim());
  const passwordError = passwordTouched && password.length < 6;

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    // simple client-side validation
    if (!isValidEmail(trimmedEmail) || !password) {
      setLoginError('Please enter a valid email and password.');
      setEmailTouched(true);
      setPasswordTouched(true);
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError(null);
      await signIn(trimmedEmail, password);
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
        {/* Logo + welcome copy */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}><br /></Text>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Log in to manage your bilties and customers.
          </Text>
        </View>

        {/* Card with form */}
        <Card style={styles.card} mode="contained">
          <Card.Content>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <PaperTextInput
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setEmailTouched(true)}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              left={<PaperTextInput.Icon icon="email-outline" />}
              error={emailError}
              style={styles.input}
            />
            <HelperText type="error" visible={emailError}>
              Please enter a valid email address.
            </HelperText>

            <Text style={styles.fieldLabel}>Password</Text>
            <PaperTextInput
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              onBlur={() => setPasswordTouched(true)}
              secureTextEntry
              placeholder="••••••••"
              left={<PaperTextInput.Icon icon="lock-outline" />}
              error={passwordError}
              style={styles.input}
            />
            <HelperText type="error" visible={passwordError}>
              Password should be at least 6 characters.
            </HelperText>

            {loginError && (
              <Text style={styles.errorText}>{loginError}</Text>
            )}

            <View style={styles.buttonContainer}>
              {loginLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <PaperButton
                  mode="contained"
                  onPress={handleLogin}
                  icon="arrow-right"
                  contentStyle={styles.buttonContent}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Login
                </PaperButton>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // soft app background
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 148,
    height: 148,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSubtle,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 13,
    color: colors.textSubtle,
    marginBottom: 4,
  },
  input: {
    marginBottom: 4,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.danger,
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  button: {
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  firebaseText: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
