import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Screen, Text, radius, spacing, useTheme } from '@itqan/design-system';
import { SurahPicker } from '@/components/SurahPicker';
import { Stepper } from '@/components/Stepper';
import { Ornament } from '@/components/Ornament';
import { useSurahs } from '@/features/quran/hooks';
import type { SurahRow } from '@/db/repositories/quranRepo';
import { listTasmiSessions, listWeakSpots } from '@/db/repositories/tasmiRepo';
import { transcriptionInfo } from '@/features/tasmi/transcription';
import { useT } from '@/i18n';

export default function TasmiScreen() {
  const theme = useTheme();
  const t = useT();
  const { data: surahs } = useSurahs();
  const [picker, setPicker] = useState(false);
  const [surah, setSurah] = useState<SurahRow | null>(null);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(5);

  const { data: sessions } = useQuery({
    queryKey: ['tasmiSessions'],
    queryFn: () => listTasmiSessions(5),
  });
  const { data: weakSpots } = useQuery({ queryKey: ['weakSpots'], queryFn: listWeakSpots });
  const info = transcriptionInfo();

  useEffect(() => {
    if (!surah && surahs?.length) {
      setSurah(surahs[0]!);
      setTo(Math.min(5, surahs[0]!.ayahCount));
    }
  }, [surahs, surah]);

  const max = surah?.ayahCount ?? 1;

  // Never let the range exceed the surah's ayah count.
  useEffect(() => {
    setFrom((f) => Math.min(Math.max(f, 1), max));
    setTo((tv) => Math.min(Math.max(tv, 1), max));
  }, [max]);

  const start = () => {
    if (!surah) return;
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    router.push({
      pathname: '/tasmi/record',
      params: {
        first: `${surah.number}:${lo}`,
        last: `${surah.number}:${hi}`,
        title: `${surah.nameSimple} ${lo}–${hi}`,
      },
    });
  };

  return (
    <Screen scroll reading>
      <Text variant="title">{t.mode_tasmi_title}</Text>
      <Text variant="body" muted>
        {t.tasmi_subtitle}
      </Text>
      <Ornament />

      <Card>
        <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
          {t.tasmi_choose_passage}
        </Text>
        <Pressable style={styles.row} onPress={() => setPicker(true)}>
          <Text variant="bodyStrong">
            {surah ? `${surah.number}. ${surah.nameSimple}` : t.common_choose}
          </Text>
          <Text variant="caption" color={theme.colors.primary}>
            {t.common_change}
          </Text>
        </Pressable>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <Stepper label={t.select_from_ayah} value={from} min={1} max={max} onChange={setFrom} />
          <Stepper label={t.select_to_ayah} value={to} min={1} max={max} onChange={setTo} />
        </View>
        <Button label={t.tasmi_start} fullWidth onPress={start} style={{ marginTop: spacing.lg }} />
        {!info.supported ? (
          <Text variant="caption" muted style={{ marginTop: spacing.sm }}>
            {t.tasmi_unsupported}
          </Text>
        ) : null}
      </Card>

      {weakSpots && weakSpots.length > 0 ? (
        <Pressable onPress={() => router.push('/bookmarks')}>
          <Card>
            <Text variant="bodyStrong">{t.tasmi_weak_spots(weakSpots.length)}</Text>
            <Text variant="caption" muted>
              {t.tasmi_weak_spots_hint}
            </Text>
          </Card>
        </Pressable>
      ) : null}

      {sessions && sessions.length > 0 ? (
        <Card>
          <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
            {t.tasmi_recent}
          </Text>
          <View style={{ gap: spacing.sm }}>
            {sessions.map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <Text variant="body">{s.target}</Text>
                <Text variant="caption" muted>
                  {t.tasmi_session_summary(s.overallScore, s.mistakeCount)}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <Text variant="label" muted style={{ textAlign: 'center' }}>
        {t.tasmi_disclaimer}
      </Text>

      <SurahPicker
        visible={picker}
        onClose={() => setPicker(false)}
        onSelect={(s) => {
          setSurah(s);
          setFrom(1);
          setTo(Math.min(5, s.ayahCount));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
});
