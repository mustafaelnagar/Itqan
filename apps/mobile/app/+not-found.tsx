import React from 'react';
import { Link, Stack } from 'expo-router';
import { Screen, Text, spacing } from '@itqan/design-system';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen>
        <Text variant="title" style={{ marginBottom: spacing.md }}>
          This page doesn&apos;t exist.
        </Text>
        <Link href="/">
          <Text variant="bodyStrong">Go to home</Text>
        </Link>
      </Screen>
    </>
  );
}
