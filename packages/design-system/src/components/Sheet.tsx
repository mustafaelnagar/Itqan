import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { radius, spacing } from '../tokens/spacing';
import { Text } from './Text';
import { useTheme } from './ThemeProvider';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Bottom sheet primitive — used for tafsir drawers, reciter pickers,
 * repair drills, and quick actions. Lightweight Modal-based implementation;
 * apps may swap in a gesture-driven sheet later without changing the API.
 */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close sheet" />
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
        {title ? (
          <Text variant="heading" style={styles.title}>
            {title}
          </Text>
        ) : null}
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.lg },
});
