// src/components/AdminBottomNav.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

type TabItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  href: string;
};

const TABS: TabItem[] = [
  { key: 'home',      label: 'Home',      icon: 'home-variant',                  href: '/(admin)' },
  { key: 'customers', label: 'Customers', icon: 'account-group-outline',         href: '/(admin)/customers' },
  { key: 'new',       label: 'New',       icon: 'plus-circle-outline',           href: '/(admin)/bilties/new' },
  { key: 'bilties',   label: 'Bilties',   icon: 'file-document-multiple-outline',href: '/(admin)/bilties' },
  { key: 'account',   label: 'Account',   icon: 'account-circle-outline',        href: '/(admin)/profile' },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handlePress = (href: string) => {
    // Already on this exact route ⇒ do nothing
    if (pathname === href) return;

    if (href === '/(admin)') {
      // ✅ Home should not stack history – behave like a native tab root
      router.replace(href as any);
    } else {
      // ✅ All other tabs keep the old behaviour (push),
      // so back button still works like before
      router.push(href as any);
    }
  };

  const isActiveTab = (href: string) => {
    if (href === '/(admin)') {
      // Home is active only on its root
      return pathname === href;
    }
    // Other tabs are active on their root and nested routes
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = isActiveTab(tab.href);

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handlePress(tab.href)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && styles.iconWrapperActive,
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={20}
                color={isActive ? colors.textMain : colors.textSubtle}
              />
            </View>
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.primarySoft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#ffffffaa',
  },
  label: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },
  labelActive: {
    color: colors.textMain,
    fontWeight: '600',
  },
});
