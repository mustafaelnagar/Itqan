import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, useTheme } from '@itqan/design-system';
import { logger } from '@itqan/logging';
import { downloadSurah, isSurahDownloaded } from '../audio/downloadManager';
import { useReaderSettings } from '../stores/readerSettings';

type State = 'idle' | 'downloading' | 'done';

/** Download a surah's audio for the active reciter, with inline progress (AUD-007). */
export function DownloadButton({ surah, ayahCount }: { surah: number; ayahCount: number }) {
  const theme = useTheme();
  const reciterId = useReaderSettings((s) => s.preferredReciterId);
  const [state, setState] = useState<State>('idle');
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let active = true;
    void isSurahDownloaded(reciterId, surah, ayahCount).then((done) => {
      if (active) setState(done ? 'done' : 'idle');
    });
    return () => {
      active = false;
    };
  }, [reciterId, surah, ayahCount]);

  const onPress = async () => {
    if (state !== 'idle') return;
    setState('downloading');
    try {
      await downloadSurah(reciterId, surah, ayahCount, ({ completed, total }) =>
        setPct(Math.round((completed / total) * 100)),
      );
      setState('done');
    } catch (err) {
      logger.captureException(err, { feature: 'audio_download' });
      setState('idle');
    }
  };

  if (state === 'downloading') {
    return (
      <Pressable
        accessibilityLabel={`Downloading ${pct}%`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
      >
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text variant="label" color={theme.colors.primary}>
          {pct}%
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityLabel="Download surah audio" hitSlop={6} onPress={onPress}>
      <Ionicons
        name={state === 'done' ? 'cloud-done' : 'cloud-download-outline'}
        size={22}
        color={state === 'done' ? theme.colors.success : theme.colors.primary}
      />
    </Pressable>
  );
}
