import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Screen, Text, radius, spacing, useTheme } from '@itqan/design-system';
import { useSurahs } from '@/features/quran/hooks';
import {
  useActivePlan,
  useDueBuckets,
  useDueCount,
  useDueItems,
  useOverallStats,
  usePlanProgress,
} from '@/features/hifz/hooks';
import type { HifzPlanItemRow } from '@/db/repositories/planRepo';
import { useHifzSettings } from '@/stores/hifzSettings';
import { Stepper } from '@/components/Stepper';
import { Ornament, OrnateFrame } from '@/components/Ornament';
import { toArabicNumerals } from '@/lib/format';
import { useLocale } from '@/i18n';

/** Total ayāt in the muṣḥaf — denominator for the "% of Qurʾān memorized" stat. */
const TOTAL_QURAN_AYAH = 6236;

export default function HifzStudioScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const { data: surahs } = useSurahs();
  const { data: plan } = useActivePlan();
  const { data: dueItems } = useDueItems(plan?.id);
  const { data: progress } = usePlanProgress(plan?.id);
  const { data: stats } = useOverallStats();
  const { data: dueCount } = useDueCount();
  const { data: buckets } = useDueBuckets();
  const { dailyTarget, setDailyTarget } = useHifzSettings();

  const label = useCallback(
    (first: string, last: string) => {
      const name = (key: string) => {
        const s = Number(key.split(':')[0]);
        const row = surahs?.find((x) => x.number === s);
        return (isRTL ? row?.nameArabic : row?.nameSimple) ?? t.surah_fallback(s);
      };
      const num = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));
      const a = num(Number(first.split(':')[1]));
      const b = num(Number(last.split(':')[1]));
      return name(first) === name(last)
        ? `${name(first)} ${a}–${b}`
        : `${name(first)} ${a} – ${name(last)} ${b}`;
    },
    [surahs, isRTL, t],
  );

  const startItem = (item: HifzPlanItemRow) =>
    router.push({
      pathname: '/hifz/session',
      params: {
        first: item.firstAyahKey,
        last: item.lastAyahKey,
        title: label(item.firstAyahKey, item.lastAyahKey),
        itemId: item.id,
        planId: item.planId,
      },
    });

  const memorized = stats?.memorizedAyat ?? 0;
  const quranPct = Math.min(100, Math.round((memorized / TOTAL_QURAN_AYAH) * 100));
  const num = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  return (
    <Screen scroll>
      <Text variant="title">{t.hifz_title}</Text>
      <Ornament style={{ marginBottom: spacing.xs }} />

      {/* Daily murājaʿah — the heart of long-term retention. Surfaces due ayāt and
          splits them into the classical sabaq / sabqi / manzil tracks. */}
      <OrnateFrame>
        <Text variant="bodyStrong" style={{ textAlign: 'center' }}>
          {t.hifz_muraja_title}
        </Text>
        <Text variant="caption" muted style={{ textAlign: 'center', marginTop: 2 }}>
          {(dueCount ?? 0) > 0 ? t.hifz_muraja_body(dueCount ?? 0) : t.hifz_no_due}
        </Text>
        <View style={styles.buckets}>
          <Bucket label={t.bucket_sabaq} value={buckets?.sabaq ?? 0} color={theme.colors.danger} num={num} />
          <Bucket label={t.bucket_sabqi} value={buckets?.sabqi ?? 0} color={theme.colors.warning} num={num} />
          <Bucket label={t.bucket_manzil} value={buckets?.manzil ?? 0} color={theme.colors.success} num={num} />
        </View>
        <Button
          label={t.hifz_start_review}
          fullWidth
          disabled={(dueCount ?? 0) === 0}
          onPress={() => router.push('/hifz/review')}
          style={{ marginTop: spacing.md }}
        />
      </OrnateFrame>

      {/* Overall progress — how much of the whole Qurʾān is memorized. */}
      <Card>
        <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
          {t.hifz_overall_progress}
        </Text>
        <View style={[styles.progressHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text variant="display" color={theme.colors.primary}>
            {num(quranPct)}%
          </Text>
          <Text variant="caption" muted style={styles.progressCaption}>
            {t.hifz_quran_memorized}
            {'\n'}
            {num(memorized)} / {num(TOTAL_QURAN_AYAH)}
          </Text>
        </View>
        <ProgressBar pct={quranPct} color={theme.colors.memory.strong} track={theme.colors.border} />
        {plan && progress && progress.total > 0 ? (
          <View style={{ marginTop: spacing.md }}>
            <View style={styles.rowBetween}>
              <Text variant="caption" muted numberOfLines={1} style={{ flex: 1 }}>
                {plan.title}
              </Text>
              <Text variant="caption" muted>
                {t.hifz_progress(progress.done, progress.total)}
              </Text>
            </View>
            <ProgressBar
              pct={Math.round((progress.done / progress.total) * 100)}
              color={theme.colors.primary}
              track={theme.colors.border}
              style={{ marginTop: spacing.xs }}
            />
          </View>
        ) : null}
      </Card>

      {/* Memory health (Module 6 snapshot) */}
      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.md }}>
          {t.hifz_memory_health}
        </Text>
        <View style={styles.stats}>
          <Stat
            label={t.home_stat_memorized}
            value={stats?.memorizedAyat ?? 0}
            color={theme.colors.success}
          />
          <Stat label={t.home_stat_weak} value={stats?.weakAyat ?? 0} color={theme.colors.danger} />
          <Stat label={t.hifz_due_today} value={dueCount ?? 0} color={theme.colors.warning} />
        </View>
      </Card>

      {/* Today's session from the active plan */}
      {plan ? (
        <Card>
          <View style={styles.rowBetween}>
            <Text variant="bodyStrong">{t.hifz_todays_session}</Text>
            <Text variant="caption" muted>
              {progress ? t.hifz_progress(progress.done, progress.total) : ''}
            </Text>
          </View>
          <Text variant="caption" muted style={{ marginBottom: spacing.md }}>
            {plan.title}
          </Text>
          {dueItems && dueItems.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              {dueItems.slice(0, 4).map((item) => (
                <View key={item.id} style={[styles.item, { borderColor: theme.colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body">{label(item.firstAyahKey, item.lastAyahKey)}</Text>
                    <Text variant="caption" muted>
                      {t.ayat_count(item.ayahCount)} · {item.scheduledDate}
                    </Text>
                  </View>
                  <Button label={t.common_start} size="sm" onPress={() => startItem(item)} />
                </View>
              ))}
            </View>
          ) : (
            <Text variant="body" muted>
              {t.hifz_all_caught_up}
            </Text>
          )}
          <Button
            label={t.hifz_new_plan}
            variant="ghost"
            onPress={() => router.push('/hifz/plan')}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      ) : (
        <Card>
          <Text variant="bodyStrong" style={{ marginBottom: spacing.xs }}>
            {t.hifz_start_plan_title}
          </Text>
          <Text variant="body" muted style={{ marginBottom: spacing.lg }}>
            {t.hifz_start_plan_body}
          </Text>
          <Button label={t.hifz_create_plan} fullWidth onPress={() => router.push('/hifz/plan')} />
        </Card>
      )}

      <Card>
        <Stepper
          label={t.hifz_daily_goal}
          value={dailyTarget}
          min={1}
          max={20}
          onChange={setDailyTarget}
        />
      </Card>

      <Button
        label={t.hifz_memorize_passage}
        variant="secondary"
        fullWidth
        onPress={() => router.push('/hifz/select')}
      />
    </Screen>
  );
}

function ProgressBar({
  pct,
  color,
  track,
  style,
}: {
  pct: number;
  color: string;
  track: string;
  style?: object;
}) {
  return (
    <View style={[styles.track, { backgroundColor: track }, style]}>
      <View style={[styles.fill, { width: `${Math.max(2, Math.min(100, pct))}%`, backgroundColor: color }]} />
    </View>
  );
}

function Bucket({
  label,
  value,
  color,
  num,
}: {
  label: string;
  value: number;
  color: string;
  num: (n: number) => string;
}) {
  return (
    <View style={styles.bucket}>
      <Text variant="title" color={color}>
        {num(value)}
      </Text>
      <Text variant="caption" muted style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="display" color={color}>
        {value}
      </Text>
      <Text variant="caption" muted>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  buckets: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  bucket: { alignItems: 'center', flex: 1, gap: 2 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  progressCaption: { flex: 1, lineHeight: 18 },
  track: { height: 10, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: 10, borderRadius: radius.full },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
