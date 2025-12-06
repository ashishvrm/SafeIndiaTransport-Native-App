import { NavigationContainer } from '@react-navigation/native';
import {
    createNativeStackNavigator
} from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import { AuthUser, UserRole } from '../types/auth';

export type RootStackParamList = {
  Login: undefined;
  AdminDashboard: undefined;
  CustomerDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const userRole: UserRole | null = currentUser?.role ?? null;

  const authContext = useMemo(
    () => ({
      loginAsRole: (role: UserRole) => {
        // For now, we use a simple mock user.
        // Later, replace with Firebase user object.
        const mockUser: AuthUser = {
          id: 'mock-id',
          name: role === 'admin' ? 'Admin User' : 'Customer User',
          role,
          email: role === 'admin' ? 'admin@example.com' : 'customer@example.com',
        };
        setCurrentUser(mockUser);
      },
      logout: () => setCurrentUser(null),
    }),
    []
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userRole == null ? (
          // Not logged in → show Login screen
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => (
              <LoginScreen
                {...props}
                onMockLoginAsAdmin={() => authContext.loginAsRole('admin')}
                onMockLoginAsCustomer={() =>
                  authContext.loginAsRole('customer')
                }
              />
            )}
          </Stack.Screen>
        ) : userRole === 'admin' ? (
          // Admin logged in
          <Stack.Screen
            name="AdminDashboard"
            options={{ title: 'Admin Dashboard asd' }}
          >
            {(props) => (
              <AdminDashboardScreen {...props} onLogout={authContext.logout} />
            )}
          </Stack.Screen>
        ) : (
          // Customer logged in
          <Stack.Screen
            name="CustomerDashboard"
            options={{ title: 'Customer Dashboard' }}
          >
            {(props) => (
              <CustomerDashboardScreen
                {...props}
                onLogout={authContext.logout}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
