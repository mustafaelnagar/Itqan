import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, radius, spacing, useTheme } from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SurahPicker } from '@/components/SurahPicker';
import { Stepper } from '@/components/Stepper';
import { RangeBar } from '@/components/RangeBar';
import { useCreatePlan } from '@/features/hifz/hooks';
import type { CreatePlanInput } from '@/db/repositories/planRepo';
import type { SurahRow } from '@/db/repositories/quranRepo';
import { useHifzSettings } from '@/stores/hifzSettings';
import { useLocale } from '@/i18n';

type Goal = 'juz_amma' | 'juz' | 'surah' | 'surah_range' | 'full_quran';

/** A single selectable row in the unified plan table. */
type PlanRow =
  | { id: string; kind: 'preset'; title: string; desc: string; input: CreatePlanInput }
  | { id: string; kind: 'goal'; goal: Goal; title: string; desc: string };

/** Show the localized surah name: Arabic in RTL UIs, transliteration otherwise. */
const surahName = (s: SurahRow, isRTL: boolean) => (isRTL ? s.nameArabic : s.nameSimple);

/** PLN-001..004: pick any plan — proven preset or a custom goal — from one table. */
export default function CreatePlanScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const dailyTarget = useHifzSettings((s) => s.dailyTarget);
  const createPlan = useCreatePlan();

  // Proven, curated routines — selecting one needs no further configuration.
  const PRESETS: { title: string; desc: string; input: CreatePlanInput }[] = [
    {
      title: t.preset_juz_amma_title,
      desc: `${t.preset_juz_amma_desc} · ${t.plan_per_day(5)}`,
      input: { type: 'juz_amma', title: t.preset_juz_amma_title, scopeType: 'juz', scopeId: 30, dailyCapacity: 5 },
    },
    {
      title: t.preset_page_day_title,
      desc: t.preset_page_day_desc,
      input: { type: 'full_quran', title: t.preset_page_day_title, scopeType: 'all', scopeId: null, dailyCapacity: 1, unit: 'page' },
    },
    {
      title: t.preset_mixed_title,
      desc: t.preset_mixed_desc,
      input: { type: 'full_quran', title: t.preset_mixed_title, scopeType: 'all', scopeId: null, dailyCapacity: 1, unit: 'mixed' },
    },
    {
      title: t.preset_quran_3y_title,
      desc: `${t.preset_quran_3y_desc} · ${t.plan_per_day(6)}`,
      input: { type: 'full_quran', title: t.preset_quran_3y_title, scopeType: 'all', scopeId: null, dailyCapacity: 6 },
    },
    {
      title: t.preset_quran_5y_title,
      desc: `${t.preset_quran_5y_desc} · ${t.plan_per_day(4)}`,
      input: { type: 'full_quran', title: t.preset_quran_5y_title, scopeType: 'all', scopeId: null, dailyCapacity: 4 },
    },
    {
      title: t.preset_quran_1y_title,
      desc: `${t.preset_quran_1y_desc} · ${t.plan_per_day(17)}`,
      input: { type: 'full_quran', title: t.preset_quran_1y_title, scopeType: 'all', scopeId: null, dailyCapacity: 17 },
    },
  ];

  // Custom goals — each one reveals its own configuration controls when selected.
  const GOALS: { goal: Goal; title: string; desc: string }[] = [
    { goal: 'juz_amma', title: t.goal_juz_amma, desc: t.goal_juz_amma_hint },
    { goal: 'juz', title: t.goal_juz, desc: t.goal_juz_hint },
    { goal: 'surah', title: t.goal_surah, desc: t.goal_surah_hint },
    { goal: 'surah_range', title: t.goal_surah_range, desc: t.goal_surah_range_hint },
    { goal: 'full_quran', title: t.goal_full_quran, desc: t.goal_full_quran_hint },
  ];

  // The one merged table: proven presets first, then custom goals.
  const ROWS: PlanRow[] = [
    ...PRESETS.map((p, i) => ({ id: `preset:${i}`, kind: 'preset' as const, ...p })),
    ...GOALS.map((g) => ({ id: `goal:${g.goal}`, kind: 'goal' as const, ...g })),
  ];

  const [selectedId, setSelectedId] = useState<string>(ROWS[0]!.id);
  const selected = ROWS.find((r) => r.id === selectedId) ?? ROWS[0]!;
  const goal = selected.kind === 'goal' ? selected.goal : null;

  const [surah, setSurah] = useState<SurahRow | null>(null);
  const [rangeStart, setRangeStart] = useState<SurahRow | null>(null);
  const [rangeEnd, setRangeEnd] = useState<SurahRow | null>(null);
  const [picker, setPicker] = useState<null | 'single' | 'start' | 'end'>(null);
  const [juz, setJuz] = useState(1);
  const [capacity, setCapacity] = useState(dailyTarget);

  // Single-surah ayah range. Defaults to the WHOLE surah (every ayah); the hafiz
  // can flip to a custom from→to span on the surah.
  const [wholeSurah, setWholeSurah] = useState(true);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(1);
  const maxAyah = surah?.ayahCount ?? 1;

  // When the surah changes, reset to "whole surah" (all ayāt 1…count).
  useEffect(() => {
    setWholeSurah(true);
    setFromAyah(1);
    setToAyah(maxAyah);
  }, [surah, maxAyah]);

  const ayahLo = Math.min(fromAyah, toAyah);
  const ayahHi = Math.max(fromAyah, toAyah);

  const canCreate =
    selected.kind === 'preset'
      ? true
      : goal === 'surah'
        ? !!surah
        : goal === 'surah_range'
          ? !!rangeStart && !!rangeEnd
          : true;

  const onCreate = () => {
    let input: CreatePlanInput;
    if (selected.kind === 'preset') {
      input = selected.input;
    } else if (goal === 'juz_amma') {
      input = { type: 'juz_amma', title: t.goal_juz_amma, scopeType: 'juz', scopeId: 30, dailyCapacity: capacity };
    } else if (goal === 'juz') {
      input = { type: 'custom', title: t.juz_label(juz), scopeType: 'juz', scopeId: juz, dailyCapacity: capacity };
    } else if (goal === 'full_quran') {
      input = { type: 'full_quran', title: t.goal_full_quran, scopeType: 'all', scopeId: null, dailyCapacity: capacity };
    } else if (goal === 'surah_range') {
      if (!rangeStart || !rangeEnd) return;
      const [lo, hi] =
        rangeStart.number <= rangeEnd.number ? [rangeStart, rangeEnd] : [rangeEnd, rangeStart];
      input = {
        type: 'custom',
        title: `${surahName(lo, isRTL)} – ${surahName(hi, isRTL)}`,
        scopeType: 'surah_range',
        scopeId: lo.number,
        scopeIdEnd: hi.number,
        dailyCapacity: capacity,
      };
    } else {
      if (!surah) return;
      const partial = !wholeSurah && !(ayahLo === 1 && ayahHi === maxAyah);
      input = {
        type: 'surah',
        title: partial ? `${surahName(surah, isRTL)} ${ayahLo}–${ayahHi}` : surahName(surah, isRTL),
        scopeType: 'surah',
        scopeId: surah.number,
        // Omit the bounds for a whole-surah plan so every ayah is included.
        ayahStart: partial ? ayahLo : null,
        ayahEnd: partial ? ayahHi : null,
        dailyCapacity: capacity,
      };
    }
    createPlan.mutate(input, {
      // Return to the previous screen, or jump to the Hifz tab when there's no
      // history to pop (e.g. on web after a refresh, where router.back() is a
      // no-op — which made a successful create look like "nothing happened").
      onSuccess: () => {
        if (router.canGoBack()) router.back();
        else router.replace('/hifz');
      },
      onError: (err) => {
        console.error('Failed to create Hifz plan', err);
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScreenHeader title={t.plan_title} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* One unified table of every plan — proven presets and custom goals. */}
        <Card>
          <Text variant="bodyStrong">{t.plan_pick_title}</Text>
          <Text variant="caption" muted style={{ marginTop: 2, marginBottom: spacing.sm }}>
            {t.plan_well_tested_hint}
          </Text>
          <View style={{ gap: spacing.sm }}>
            {ROWS.map((row) => {
              const active = row.id === selectedId;
              return (
                <Pressable
                  key={row.id}
                  onPress={() => setSelectedId(row.id)}
                  style={[
                    styles.row,
                    {
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.surface : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.rowHead}>
                    <Text variant="bodyStrong" color={active ? theme.colors.primary : theme.colors.text}>
                      {row.title}
                    </Text>
                    {row.kind === 'preset' ? (
                      <View style={[styles.badge, { borderColor: theme.colors.accent }]}>
                        <Text variant="label" color={theme.colors.accent}>
                          {t.plan_ready_badge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text variant="caption" muted style={{ marginTop: 2 }}>
                    {row.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Configuration for the selected custom goal. */}
        {goal === 'surah' ? (
          <Card>
            <Pressable style={styles.pickRow} onPress={() => setPicker('single')}>
              <Text variant="body">
                {surah ? `${surah.number}. ${surahName(surah, isRTL)}` : t.plan_choose_surah}
              </Text>
              <Text variant="caption" color={theme.colors.primary}>
                {t.common_change}
              </Text>
            </Pressable>

            {surah ? (
              <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
                <Text variant="label" muted>
                  {t.plan_ayah_range_label}
                </Text>
                {/* Whole surah (all ayāt) ↔ a custom from→to range. */}
                <View style={styles.segment}>
                  {[
                    { whole: true, label: t.plan_whole_surah },
                    { whole: false, label: t.plan_part_surah },
                  ].map((opt) => {
                    const on = wholeSurah === opt.whole;
                    return (
                      <Pressable
                        key={opt.label}
                        onPress={() => setWholeSurah(opt.whole)}
                        style={[
                          styles.segmentItem,
                          {
                            backgroundColor: on ? theme.colors.primary : theme.colors.surface,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Text variant="caption" color={on ? theme.colors.primaryContrast : theme.colors.text}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {wholeSurah ? (
                  <Text variant="caption" muted>
                    {t.ayat_count(maxAyah)}
                  </Text>
                ) : (
                  <View style={{ gap: spacing.md }}>
                    <Stepper label={t.select_from_ayah} value={fromAyah} min={1} max={maxAyah} onChange={setFromAyah} />
                    <Stepper label={t.select_to_ayah} value={toAyah} min={1} max={maxAyah} onChange={setToAyah} />
                    <RangeBar min={1} max={maxAyah} lo={ayahLo} hi={ayahHi} />
                    <Text variant="caption" muted>
                      {ayahLo}–{ayahHi} · {t.ayat_count(ayahHi - ayahLo + 1)}
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </Card>
        ) : null}

        {goal === 'juz' ? (
          <Card>
            <Stepper label={t.plan_choose_juz} value={juz} min={1} max={30} onChange={setJuz} />
          </Card>
        ) : null}

        {goal === 'surah_range' ? (
          <Card>
            <Pressable style={styles.pickRow} onPress={() => setPicker('start')}>
              <Text variant="caption" muted>
                {t.plan_from_surah}
              </Text>
              <Text variant="body">
                {rangeStart ? `${rangeStart.number}. ${surahName(rangeStart, isRTL)}` : t.plan_choose_surah}
              </Text>
            </Pressable>
            <Pressable style={styles.pickRow} onPress={() => setPicker('end')}>
              <Text variant="caption" muted>
                {t.plan_to_surah}
              </Text>
              <Text variant="body">
                {rangeEnd ? `${rangeEnd.number}. ${surahName(rangeEnd, isRTL)}` : t.plan_choose_surah}
              </Text>
            </Pressable>
          </Card>
        ) : null}

        {/* Daily pace — only custom goals are user-paced (presets carry their own). */}
        {selected.kind === 'goal' ? (
          <Card>
            <Stepper label={t.plan_new_ayat_per_day} value={capacity} min={1} max={20} onChange={setCapacity} />
          </Card>
        ) : null}

        <Button
          label={t.plan_create}
          fullWidth
          loading={createPlan.isPending}
          disabled={!canCreate}
          onPress={onCreate}
        />
      </ScrollView>

      <SurahPicker
        visible={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={(s) => {
          if (picker === 'start') setRangeStart(s);
          else if (picker === 'end') setRangeEnd(s);
          else setSurah(s);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  row: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: { flexDirection: 'row', gap: spacing.sm },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});
