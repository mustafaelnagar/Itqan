import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Text,
  fontFamily,
  fontSize,
  lineHeight,
  radius,
  spacing,
  useContentMaxWidth,
  useTheme,
} from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AudioBar } from '@/components/AudioBar';
import { MushafFrame, Ornament, OrnateFrame } from '@/components/Ornament';
import { getAyahsBetween } from '@/db/repositories/quranRepo';
import { saveTasmiResult } from '@/db/repositories/tasmiRepo';
import {
  analyzeTasmi,
  type AyahSegment,
  type DetectedMistake,
  type ExpectedAyah,
  type TasmiAnalysis,
} from '@/features/tasmi/engine';
import { alignLive, type LiveAyahView } from '@/features/tasmi/liveAligner';
import { TasmiPageView } from '@/components/TasmiPageView';
import {
  liveDictationAvailable,
  startDictation,
  transcriptionInfo,
  type DictationSession,
} from '@/features/tasmi/transcription';
import {
  startWhisperRecording,
  whisperAvailable,
  type WhisperRecorder,
} from '@/features/tasmi/whisper';
import { playQueue } from '@/audio/player';
import { usePlayback } from '@/stores/playback';
import { recognitionLocale, useLocale, useT, type Dictionary } from '@/i18n';

type Phase = 'ready' | 'recording' | 'analyzing' | 'result' | 'repair';

/** How long the reciter may dwell on a word before it turns red. */
const GRACE_MS = 2600;

const mistakeLabel = (t: Dictionary, type: string): string =>
  ({
    missed_word: t.mistake_missed_word,
    extra_word: t.mistake_extra_word,
    wrong_word: t.mistake_wrong_word,
    repeated_word: t.mistake_repeated_word,
    skipped_ayah: t.mistake_skipped_ayah,
    stopped_early: t.mistake_stopped_early,
    wrong_continuation: t.mistake_wrong_continuation,
  })[type] ?? type;

export default function TasmiRecordScreen() {
  const theme = useTheme();
  const { t, lang } = useLocale();
  const params = useLocalSearchParams<{ first: string; last: string; title?: string }>();
  const info = transcriptionInfo();
  // Live word-fill needs the browser's streaming recognizer; Whisper-only
  // browsers record silently and only fill in the verdict after you stop.
  const liveSyncOn = liveDictationAvailable();

  const { data: ayahs } = useQuery({
    queryKey: ['tasmiRange', params.first, params.last],
    queryFn: () => getAyahsBetween(params.first, params.last),
    enabled: !!params.first && !!params.last,
  });

  const expected = useMemo<ExpectedAyah[]>(
    () => (ayahs ?? []).map((a) => ({ ayahKey: a.key, text: a.text })),
    [ayahs],
  );

  const [phase, setPhase] = useState<Phase>('ready');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<TasmiAnalysis | null>(null);
  const [status, setStatus] = useState('');
  const session = useRef<DictationSession | null>(null);
  const whisper = useRef<WhisperRecorder | null>(null);
  const maxWidth = useContentMaxWidth('reading');

  // Live sync recomputes against the stored text on every recognized update.
  const live = useMemo(() => alignLive(expected, transcript), [expected, transcript]);

  // Grace period: only raise the red "you're stuck here" flag once the reciter
  // has lingered on the same expected word for a beat — never the instant a
  // word doesn't match (ASR lags, mishears, and self-corrects constantly).
  const stallAt = useRef(0);
  const lastPointer = useRef(-1);
  if (live.pointer !== lastPointer.current) {
    lastPointer.current = live.pointer;
    stallAt.current = Date.now();
  }
  const [, setClock] = useState(0);
  useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => setClock(Date.now()), 500);
    return () => clearInterval(id);
  }, [phase]);
  const alarm =
    liveSyncOn &&
    phase === 'recording' &&
    !live.complete &&
    live.total > 0 &&
    Date.now() - stallAt.current > GRACE_MS;

  // Release the mic if the user leaves mid-session.
  useEffect(() => {
    return () => {
      session.current?.cancel();
      whisper.current?.cancel();
    };
  }, []);

  const beginRecording = useCallback(async () => {
    setTranscript('');
    setStatus('');
    stallAt.current = Date.now();
    try {
      // On-device Whisper captures the audio for the accurate final transcript…
      if (whisperAvailable()) {
        whisper.current = await startWhisperRecording();
      }
      // …while the browser's live recognizer (if any) fills the page as you go.
      if (liveDictationAvailable()) {
        try {
          session.current = startDictation(setTranscript, recognitionLocale(lang));
        } catch {
          session.current = null;
        }
      }
      if (!whisper.current && !session.current) return; // nothing to record with
      setPhase('recording');
    } catch {
      // Mic permission denied or unsupported — clean up and stay on the ready view.
      whisper.current?.cancel();
      whisper.current = null;
    }
  }, [lang]);

  const finishRecording = useCallback(async () => {
    if (!whisper.current && !session.current) return;
    setPhase('analyzing');

    // Live recognizer's text is the fallback if Whisper yields nothing.
    let liveText = '';
    if (session.current) {
      liveText = await session.current.stop().catch(() => '');
      session.current = null;
    }

    let finalText = '';
    let source = info.source;
    if (whisper.current) {
      try {
        finalText = await whisper.current.stopAndTranscribe((s) =>
          setStatus(s.phase === 'loading-model' ? t.record_loading_model : t.record_transcribing),
        );
        source = 'whisper-web';
      } catch {
        finalText = ''; // fall back to the live transcript below
      }
      whisper.current = null;
    }

    const text = finalText || liveText || transcript;
    if (!finalText) source = liveText ? 'web-speech' : info.source;

    const result = analyzeTasmi(expected, text);
    setAnalysis(result);
    await saveTasmiResult(
      params.title ?? `${params.first}-${params.last}`,
      result,
      text,
      source,
    );
    setPhase('result');
  }, [expected, transcript, params, info.source, t]);

  const repairAyat = useCallback(() => {
    if (!ayahs || !analysis) return;
    const weakKeys = new Set(analysis.mistakes.map((m) => m.ayahKey));
    const targets = ayahs.filter((a) => weakKeys.has(a.key));
    if (targets.length === 0) return;
    usePlayback.getState().setRepeatMode('one');
    usePlayback.getState().setRepeatCount(3);
    usePlayback.getState().set({ gapEnabled: true });
    void playQueue(targets.map((a) => ({ key: a.key, surah: a.surah, ayah: a.ayah })));
    setPhase('repair');
  }, [ayahs, analysis]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenHeader title={params.title ?? t.mode_tasmi_title} subtitle={t.record_subtitle} />

      <ScrollView
        style={{ width: '100%', maxWidth, alignSelf: 'center' }}
        contentContainerStyle={styles.body}
      >
        {phase === 'ready' && (
          <ReadyView ayat={live.ayat} supported={info.supported} onRecord={beginRecording} />
        )}

        {phase === 'recording' && (
          <LiveView
            ayat={live.ayat}
            progress={live.progress}
            alarm={alarm}
            liveSync={liveSyncOn}
            onStop={() => void finishRecording()}
          />
        )}

        {phase === 'analyzing' && (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text variant="body" muted style={{ marginTop: spacing.md, textAlign: 'center' }}>
              {status || t.record_preparing}
            </Text>
          </View>
        )}

        {phase === 'result' && analysis && (
          <ResultView
            analysis={analysis}
            onRepair={repairAyat}
            onDone={() => router.back()}
            hasMistakes={analysis.mistakes.length > 0}
          />
        )}

        {phase === 'repair' && analysis && (
          <RepairView
            mistakes={analysis.mistakes}
            onRetest={() => {
              setAnalysis(null);
              setTranscript('');
              setPhase('ready');
            }}
          />
        )}
      </ScrollView>

      <AudioBar />
    </SafeAreaView>
  );
}

function ReadyView({
  ayat,
  supported,
  onRecord,
}: {
  ayat: LiveAyahView[];
  supported: boolean;
  onRecord: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={{ gap: spacing.lg }}>
      <Text variant="body" muted style={{ textAlign: 'center' }}>
        {t.record_intro}
      </Text>

      {/* The empty page, waiting to be filled by the reciter's voice. */}
      <TasmiPageView ayat={ayat} />

      <Button
        label={supported ? t.record_start : t.record_unsupported}
        disabled={!supported}
        onPress={onRecord}
        fullWidth
        leading={<Ionicons name="mic" size={18} color={theme.colors.primaryContrast} />}
      />
    </View>
  );
}

function LiveView({
  ayat,
  progress,
  alarm,
  liveSync,
  onStop,
}: {
  ayat: LiveAyahView[];
  progress: number;
  alarm: boolean;
  liveSync: boolean;
  onStop: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.liveHeader}>
        <View style={[styles.recDot, { backgroundColor: theme.colors.danger }]} />
        <Text variant="bodyStrong" color={alarm ? theme.colors.danger : theme.colors.text}>
          {alarm ? t.record_stuck : t.record_listening}
        </Text>
      </View>

      {/* Live progress through the passage — only when streaming sync is on. */}
      {liveSync ? (
        <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: theme.colors.success, width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
      ) : (
        <Text variant="caption" muted style={{ textAlign: 'center' }}>
          {t.record_whisper_hint}
        </Text>
      )}

      <TasmiPageView ayat={ayat} alarm={alarm} />

      <Button
        label={t.record_stop}
        variant="secondary"
        fullWidth
        onPress={onStop}
        leading={<Ionicons name="stop" size={18} color={theme.colors.text} />}
      />
    </View>
  );
}

function ResultView({
  analysis,
  onRepair,
  onDone,
  hasMistakes,
}: {
  analysis: TasmiAnalysis;
  onRepair: () => void;
  onDone: () => void;
  hasMistakes: boolean;
}) {
  const theme = useTheme();
  const t = useT();
  const scoreColor =
    analysis.overallScore >= 85
      ? theme.colors.success
      : analysis.overallScore >= 60
        ? theme.colors.warning
        : theme.colors.danger;
  return (
    <View style={{ gap: spacing.lg }}>
      {/* Ornate score medallion — a dignified verdict, not a harsh grade. */}
      <OrnateFrame style={styles.scoreFrame}>
        <View style={[styles.scoreMedallion, { borderColor: scoreColor }]}>
          <Text variant="display" color={scoreColor}>
            {analysis.overallScore}
          </Text>
          <Text variant="label" color={scoreColor}>
            ٪
          </Text>
        </View>
        <Ornament style={styles.scoreRule} />
        <Text variant="bodyStrong" style={{ textAlign: 'center' }}>
          {analysis.summary}
        </Text>
      </OrnateFrame>

      <View>
        <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
          {t.record_your_recitation}
        </Text>
        <MushafFrame>
          {analysis.segments.map((seg) => (
            <SegmentLine key={seg.ayahKey} segment={seg} />
          ))}
        </MushafFrame>
        <View style={styles.legend}>
          <Legend color={theme.colors.danger} label={t.legend_different} />
          <Legend color={theme.colors.warning} label={t.legend_missed} />
        </View>
      </View>

      {hasMistakes ? (
        <Card>
          <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
            {t.record_notes}
          </Text>
          <View style={{ gap: spacing.sm }}>
            {analysis.mistakes.slice(0, 12).map((m, i) => (
              <MistakeRow key={i} mistake={m} />
            ))}
          </View>
        </Card>
      ) : null}

      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.xs }}>
          {t.record_recommended}
        </Text>
        <Text variant="body" muted>
          {analysis.recommendation}
        </Text>
      </Card>

      {hasMistakes ? <Button label={t.record_repair_now} fullWidth onPress={onRepair} /> : null}
      <Button label={t.common_done} variant="secondary" fullWidth onPress={onDone} />

      <Text variant="label" muted style={{ textAlign: 'center' }}>
        {t.record_disclaimer}
      </Text>
    </View>
  );
}

function SegmentLine({ segment }: { segment: AyahSegment }) {
  const theme = useTheme();
  const colorFor = (status: string) =>
    status === 'wrong'
      ? theme.colors.danger
      : status === 'missed'
        ? theme.colors.warning
        : theme.colors.text;
  return (
    <RNText style={styles.arabic}>
      {segment.words.map((w, i) => (
        <RNText
          key={i}
          style={{
            color: colorFor(w.status),
            textDecorationLine: w.status === 'missed' ? 'underline' : 'none',
          }}
        >
          {w.text}{' '}
        </RNText>
      ))}
    </RNText>
  );
}

function MistakeRow({ mistake }: { mistake: DetectedMistake }) {
  const theme = useTheme();
  const t = useT();
  const label = mistakeLabel(t, mistake.type);
  return (
    <View style={styles.mistakeRow}>
      <View style={[styles.dot, { backgroundColor: theme.colors.warning }]} />
      <View style={{ flex: 1 }}>
        <Text variant="caption" color={theme.colors.primary}>
          {label}
        </Text>
        {mistake.expected ? (
          <RNText style={[styles.arabicSm, { color: theme.colors.text }]}>
            {mistake.expected}
          </RNText>
        ) : null}
      </View>
    </View>
  );
}

function RepairView({ mistakes, onRetest }: { mistakes: DetectedMistake[]; onRetest: () => void }) {
  const theme = useTheme();
  const t = useT();
  const ayat = [...new Set(mistakes.map((m) => m.ayahKey))];
  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.xs }}>
          {t.record_repair_title}
        </Text>
        <Text variant="body" muted>
          {t.record_repair_body}
        </Text>
        <Text variant="caption" muted style={{ marginTop: spacing.sm }}>
          {t.record_repair_saved(ayat.length)}
        </Text>
      </Card>
      <Button label={t.record_retest} fullWidth onPress={onRetest} />
      <Text variant="label" color={theme.colors.textMuted} style={{ textAlign: 'center' }}>
        {t.record_dua}
      </Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="label" muted>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing['4xl'] * 1.5 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['2xl'] },
  arabic: {
    fontFamily: fontFamily.quran,
    fontSize: fontSize.quranMd,
    lineHeight: fontSize.quranMd * lineHeight.quran,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  arabicSm: {
    fontFamily: fontFamily.quran,
    fontSize: fontSize.quranSm,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  liveHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recDot: { width: 14, height: 14, borderRadius: radius.full },
  track: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: 8, borderRadius: radius.full },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  scoreFrame: { alignItems: 'center', gap: spacing.sm },
  scoreMedallion: {
    width: 104,
    height: 104,
    borderRadius: radius.full,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRule: { alignSelf: 'stretch', paddingHorizontal: spacing.xl },
  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  mistakeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: radius.full, marginTop: 6 },
});
