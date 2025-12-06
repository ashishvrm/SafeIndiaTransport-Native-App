// src/components/ui/StatusListItem.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { colors } from '../../theme/colors';

type StatusListItemProps = {
  title: string;
  subtitle?: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor?: string;
  onPress?: () => void;
};

export function StatusListItem({
  title,
  subtitle,
  iconName,
  iconColor = colors.primary,
  onPress,
}: StatusListItemProps) {
  const content = (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
        <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
      </View>

      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={colors.textSubtle}
      />
    </View>
  );

  if (!onPress) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  return (
    <TouchableRipple onPress={onPress} style={styles.wrapper}>
      {content}
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: colors.textMain,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSubtle,
    fontSize: 12,
  },
});
