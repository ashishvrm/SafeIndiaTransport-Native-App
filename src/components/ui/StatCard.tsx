// src/components/ui/StatCard.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { colors } from '../../theme/colors';

type StatCardProps = {
  title: string;
  value?: string | number;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  tone?: 'primary' | 'neutral';
  children?: React.ReactNode; // for custom content instead of value
};

export function StatCard({
  title,
  value,
  subtitle,
  actionLabel,
  onPressAction,
  tone = 'neutral',
  children,
}: StatCardProps) {
  const isPrimary = tone === 'primary';

  return (
    <Card
      style={[
        styles.card,
        isPrimary && { backgroundColor: colors.primarySoft },
      ]}
      mode="contained"
    >
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}

        {children ? (
          <View style={styles.customContent}>{children}</View>
        ) : (
          value !== undefined && (
            <Text variant="displaySmall" style={styles.value}>
              {value}
            </Text>
          )
        )}
      </Card.Content>

      {actionLabel && onPressAction && (
        <Card.Actions>
          <Button
            mode={isPrimary ? 'contained' : 'contained-tonal'}
            onPress={onPressAction}
            style={styles.actionButton}
          >
            {actionLabel}
          </Button>
        </Card.Actions>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 12,
    elevation: 0,
  },
  title: {
    color: colors.textMain,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSubtle,
    marginTop: 2,
  },
  value: {
    marginTop: 8,
    fontWeight: '700',
  },
  customContent: {
    marginTop: 8,
  },
  actionButton: {
    marginTop: 4,
  },
});
