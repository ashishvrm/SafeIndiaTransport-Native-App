// src/components/AdminBottomNav.tsx
import { usePathname, useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomNavigation, Icon } from 'react-native-paper';

const routes = [
  { key: 'home', title: 'Home', focusedIcon: 'home' },
  { key: 'customers', title: 'Customers', focusedIcon: 'account-group' },
  { key: 'new', title: 'New', focusedIcon: 'plus-circle' },
  { key: 'bilties', title: 'Bilties', focusedIcon: 'file-document-multiple' },
];

function getIndexFromPath(pathname: string): number {
  if (pathname.startsWith('/(admin)/customers')) return 1;
  if (pathname.startsWith('/(admin)/bilties/new')) return 2; // center +
  if (pathname.startsWith('/(admin)/bilties')) return 3;
  return 0; // default home
}

export function AdminBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const [index, setIndex] = React.useState(getIndexFromPath(pathname));

  React.useEffect(() => {
    setIndex(getIndexFromPath(pathname));
  }, [pathname]);

  const navigationState = { index, routes };

  return (
    <View style={styles.container}>
      <BottomNavigation.Bar
        navigationState={navigationState}
        onTabPress={({ route, preventDefault }) => {
          preventDefault(); // we'll navigate manually
          switch (route.key) {
            case 'home':
              router.push('/(admin)');
              break;
            case 'customers':
              router.push('/(admin)/customers');
              break;
            case 'new':
              router.push('/(admin)/bilties/new');
              break;
            case 'bilties':
              router.push('/(admin)/bilties');
              break;
          }
        }}
        renderIcon={({ route, focused, color }) => (
          <Icon source={route.focusedIcon} size={24} color={color} />
        )}
        getLabelText={({ route }) => route.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
});
