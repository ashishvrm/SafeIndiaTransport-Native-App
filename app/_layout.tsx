import { Stack } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/context/AuthContext';
import { colors } from '../src/theme/colors';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.accentBlue,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceSoft,  
    secondaryContainer: colors.primarySoft,
    onPrimary: colors.textOnPrimary,
    onSurface: colors.textMain,
    outline: colors.border,
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </PaperProvider>
  );
}
