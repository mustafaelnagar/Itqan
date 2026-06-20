import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ViewToken } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, radius, spacing, useTheme } from '@itqan/design-system';
import type { AyahRow } from '../db/repositories/quranRepo';
import { toArabicNumerals } from '../lib/format';
import { useT } from '../i18n';
import { MushafLeaf } from './MushafLeaf';

interface PageGroup {
  page: number;
  juz: number;
  /** Ayat on this page, paired with their index into the full surah list. */
  items: { ayah: AyahRow; index: number }[];
}

/**
 * Real-Mushaf reading (MUS-002): one printed leaf per screen, turned by a
 * horizontal swipe — or by tapping the left/right edge of the page, the way you
 * flip a real book. In RTL the deck is inverted so pages turn right-to-left.
 * Each leaf fits its page to the screen; tapping an ayah plays from there.
 */
export function MushafPager({
  ayahs,
  surahName,
  currentAyahKey,
  isRTL,
  onTapAyah,
  onVisiblePage,
  jumpAyah,
}: {
  ayahs: AyahRow[];
  surahName: string;
  currentAyahKey: string | null;
  isRTL: boolean;
  /** index is into the full `ayahs` array (so callers can play from there). */
  onTapAyah: (index: number) => void;
  /** Fires with the first ayah of the page that scrolls into view. */
  onVisiblePage?: (ayah: AyahRow) => void;
  /** Ayah number to turn to (e.g. from the jump bar). */
  jumpAyah?: number | null;
}) {
  const theme = useTheme();
  const t = useT();
  const listRef = useRef<FlatList<PageGroup>>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const pages = useMemo<PageGroup[]>(() => {
    const map: PageGroup[] = [];
    ayahs.forEach((ayah, i) => {
      const last = map[map.length - 1];
      if (last && last.page === ayah.page) last.items.push({ ayah, index: i });
      else map.push({ page: ayah.page, juz: ayah.juz, items: [{ ayah, index: i }] });
    });
    return map;
  }, [ayahs]);

  // The page index that holds the currently-sounding ayah (for initial landing).
  const initialIndex = useMemo(() => {
    if (!currentAyahKey) return 0;
    const i = pages.findIndex((p) => p.items.some(({ ayah }) => ayah.key === currentAyahKey));
    return i < 0 ? 0 : i;
  }, [pages, currentAyahKey]);

  useEffect(() => setIndex(initialIndex), [initialIndex]);

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(pages.length - 1, i));
      if (clamped === index || !pages.length) return;
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
      setIndex(clamped);
    },
    [index, pages.length],
  );

  // Turn to the page containing a requested ayah number (jump bar).
  useEffect(() => {
    if (jumpAyah == null || !width) return;
    const idx = pages.findIndex((p) => p.items.some(({ ayah }) => ayah.ayah === jumpAyah));
    if (idx >= 0) goTo(idx);
  }, [jumpAyah, pages, width, goTo]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const item = viewableItems.find((v) => v.isViewable);
    if (!item) return;
    const page = item.item as PageGroup;
    if (typeof item.index === 'number') setIndex(item.index);
    const first = page.items[0]?.ayah;
    if (first) onVisiblePageRef.current?.(first);
  }).current;
  const onVisiblePageRef = useRef(onVisiblePage);
  onVisiblePageRef.current = onVisiblePage;

  // Page-turn direction: a left tap moves the deck left (= previous in LTR, next
  // in RTL); a right tap is the mirror. Arrows point the way they physically go.
  const canPrev = index > 0;
  const canNext = index < pages.length - 1;
  const onLeft = () => goTo(isRTL ? index + 1 : index - 1);
  const onRight = () => goTo(isRTL ? index - 1 : index + 1);
  const leftEnabled = isRTL ? canNext : canPrev;
  const rightEnabled = isRTL ? canPrev : canNext;

  const num = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));
  const current = pages[index];

  return (
    <View style={styles.fill} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <>
          <FlatList
            ref={listRef}
            data={pages}
            horizontal
            inverted={isRTL}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => String(p.page)}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onViewableItemsChanged={onViewable}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            onScrollToIndexFailed={(info) => {
              listRef.current?.scrollToOffset({ offset: width * info.index, animated: false });
            }}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <MushafLeaf
                  ayahs={item.items.map((it) => it.ayah)}
                  surahName={surahName}
                  juz={item.juz}
                  page={item.page}
                  currentAyahKey={currentAyahKey}
                  onTapAyah={(localIndex) => onTapAyah(item.items[localIndex]?.index ?? 0)}
                />
              </View>
            )}
          />

          {/* Book-style edge tap zones — flip a page by tapping its margin. */}
          <EdgeTap side="left" enabled={leftEnabled} onPress={onLeft} icon="chevron-back" />
          <EdgeTap side="right" enabled={rightEnabled} onPress={onRight} icon="chevron-forward" />

          {/* Page indicator — always know where you are in the muṣḥaf. */}
          {current ? (
            <View style={styles.indicatorWrap} pointerEvents="none">
              <View
                style={[
                  styles.indicator,
                  { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                ]}
              >
                <Text variant="label" muted>
                  {t.page_label(num(current.page))} · {t.juz_label(num(current.juz))}
                </Text>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

/** A tall, semi-transparent tap target on a page edge with a turn-arrow. */
function EdgeTap({
  side,
  enabled,
  onPress,
  icon,
}: {
  side: 'left' | 'right';
  enabled: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const theme = useTheme();
  if (!enabled) return null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={side === 'left' ? 'Turn page left' : 'Turn page right'}
      style={[styles.edge, side === 'left' ? styles.edgeLeft : styles.edgeRight]}
    >
      <View style={[styles.edgeChip, { backgroundColor: theme.colors.surfaceElevated }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, paddingVertical: spacing.xs },
  edge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edgeLeft: { left: 0 },
  edgeRight: { right: 0 },
  edgeChip: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  indicatorWrap: { position: 'absolute', top: spacing.sm, left: 0, right: 0, alignItems: 'center' },
  indicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
