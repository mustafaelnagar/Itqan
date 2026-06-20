import { useCallback } from 'react';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  fontFamily,
  fontSize,
  lineHeight,
  radius,
  spacing,
  useTheme,
} from '@itqan/design-system';
import type { AyahRow } from '../db/repositories/quranRepo';
import { useReaderSettings } from '../stores/readerSettings';
import { useIsBookmarked, useToggleBookmark } from '../features/quran/hooks';
import { copyAyah, shareAyah } from '../lib/share';
import { toArabicNumerals } from '../lib/format';

export interface AyahCardProps {
  ayah: AyahRow;
  surahName: string;
  /** Highlight while this ayah is sounding (AUD-009). */
  isCurrent?: boolean;
  onPlay: () => void;
}

export function AyahCard({ ayah, surahName, isCurrent, onPlay }: AyahCardProps) {
  const theme = useTheme();
  const { showTranslation, fontScale } = useReaderSettings();
  // Translation tracks the Arabic size (~55%) so the two never drift apart as the
  // reader scales the font. Floored at the base body size to stay legible.
  const translationSize = Math.max(fontSize.md, fontSize.quranMd * fontScale * 0.55);
  const { data: bookmarked } = useIsBookmarked(ayah.key);
  const toggle = useToggleBookmark();

  const onShare = useCallback(() => {
    void shareAyah({
      surahName,
      surah: ayah.surah,
      ayah: ayah.ayah,
      text: ayah.text,
      translation: ayah.translation,
    });
  }, [ayah, surahName]);

  const onCopy = useCallback(() => {
    void copyAyah({
      surahName,
      surah: ayah.surah,
      ayah: ayah.ayah,
      text: ayah.text,
      translation: ayah.translation,
    });
  }, [ayah, surahName]);

  return (
    <View
      style={[
        styles.card,
        { borderBottomColor: theme.colors.border },
        isCurrent
          ? {
              backgroundColor: theme.colors.highlightSoft,
              borderRadius: radius.md,
              borderBottomColor: 'transparent',
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.highlight,
            }
          : null,
      ]}
    >
      <View style={styles.topRow}>
        {/* Gold ayah medallion, like a printed muṣḥaf's verse marker. */}
        <View style={[styles.badge, { borderColor: theme.colors.accent }]}>
          <Text variant="label" color={theme.colors.accent}>
            {toArabicNumerals(ayah.ayah)}
          </Text>
        </View>
        {ayah.sajda ? (
          <Text variant="label" color={theme.colors.accent}>
            ۩ sajda
          </Text>
        ) : null}
      </View>

      <RNText
        style={[
          styles.arabic,
          {
            color: theme.colors.text,
            fontSize: fontSize.quranMd * fontScale,
            // Line height must scale with the font, or lines overlap when enlarged.
            lineHeight: fontSize.quranMd * fontScale * lineHeight.quran,
          },
        ]}
      >
        {ayah.text}
      </RNText>

      {showTranslation && ayah.translation ? (
        <Text
          variant="body"
          muted
          style={[
            styles.translation,
            {
              // Pair the translation to the Arabic: ~55% of its size and scaling
              // together, so enlarging the Mushaf keeps both readable.
              fontSize: translationSize,
              lineHeight: translationSize * lineHeight.relaxed,
            },
          ]}
        >
          {ayah.translation}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Action
          icon={isCurrent ? 'volume-high' : 'play-circle-outline'}
          label="Play"
          color={isCurrent ? theme.colors.highlight : theme.colors.textMuted}
          onPress={onPlay}
        />
        <Action
          icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
          label="Bookmark"
          color={bookmarked ? theme.colors.accent : theme.colors.textMuted}
          onPress={() => toggle.mutate(ayah.key)}
        />
        <Action icon="copy-outline" label="Copy" color={theme.colors.textMuted} onPress={onCopy} />
        <Action
          icon="share-outline"
          label="Share"
          color={theme.colors.textMuted}
          onPress={onShare}
        />
      </View>
    </View>
  );
}

function Action({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={styles.action}
    >
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabic: {
    fontFamily: fontFamily.quran,
    writingDirection: 'rtl',
    textAlign: 'right',
    // fontSize + lineHeight are set inline so they scale with fontScale.
  },
  translation: {
    textAlign: 'left',
    writingDirection: 'ltr',
    // fontSize + lineHeight are set inline so they scale with the Arabic.
  },
  actions: { flexDirection: 'row', gap: spacing.xl, paddingTop: spacing.xs },
  action: { padding: spacing.xs },
});
