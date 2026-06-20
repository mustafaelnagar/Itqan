import React from 'react';
import { View } from 'react-native';
import { Card, Screen, Text, spacing } from '@itqan/design-system';

/** Shared placeholder for mode screens whose features land in later releases. */
export function ComingSoon({
  title,
  tagline,
  release,
  features,
}: {
  title: string;
  tagline: string;
  release: string;
  features: string[];
}) {
  return (
    <Screen scroll>
      <View style={{ gap: spacing.xs }}>
        <Text variant="title">{title}</Text>
        <Text variant="body" muted>
          {tagline}
        </Text>
      </View>
      <Card>
        <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
          ARRIVING IN {release.toUpperCase()}
        </Text>
        <View style={{ gap: spacing.sm }}>
          {features.map((f) => (
            <Text key={f} variant="body">
              • {f}
            </Text>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
