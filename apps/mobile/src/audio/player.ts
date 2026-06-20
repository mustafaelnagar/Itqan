/**
 * Imperative audio engine (AUD-002..009).
 *
 * Owns a single expo-av Sound, plays an ordered queue of ayat, and supports
 * ayah/range playback, repeat (one/range), and variable speed. Playback status
 * is mirrored into the `usePlayback` store for synced highlighting + transport UI.
 */
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import { logger } from '@itqan/logging';
import { usePlayback } from '../stores/playback';
import { useReaderSettings } from '../stores/readerSettings';
import { getReciter, isSurahReciter } from './reciters';
import { resolveAyahSource, resolveSurahSource } from './urls';

export interface PlayItem {
  key: string;
  surah: number;
  ayah: number;
}

let sound: Audio.Sound | null = null;
let queue: PlayItem[] = [];
let index = 0;
// True when the active reciter is per-surah: the queue holds one item per surah,
// each item plays a whole-surah file, and per-ayah gap/highlight don't apply.
let surahMode = false;
let repeatForCurrent = 0; // remaining repeats of the current ayah (mode 'one')
let rangeLoopsRemaining = 0; // remaining whole-queue loops (mode 'range')
let audioModeReady = false;
let lastDurationMs = 0; // duration of the most recently loaded ayah (for gap timing)
let gapTimer: ReturnType<typeof setTimeout> | null = null;
let gapResolve: (() => void) | null = null;

/** Cancel any in-progress silent gap (AUD-011). */
function cancelGap(): void {
  if (gapTimer) {
    clearTimeout(gapTimer);
    gapTimer = null;
  }
  if (gapResolve) {
    gapResolve();
    gapResolve = null;
  }
}

async function ensureAudioMode(): Promise<void> {
  if (audioModeReady) return;
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true, // AUD-005 background audio
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  });
  audioModeReady = true;
}

async function unload(): Promise<void> {
  if (sound) {
    sound.setOnPlaybackStatusUpdate(null);
    try {
      await sound.unloadAsync();
    } catch {
      /* already unloaded */
    }
    sound = null;
  }
}

function onStatus(status: AVPlaybackStatus): void {
  if (!status.isLoaded) {
    if (status.error) logger.captureMessage(`audio error: ${status.error}`, 'error');
    return;
  }
  if (status.durationMillis) lastDurationMs = status.durationMillis;
  if (status.didJustFinish) void handleFinished();
}

async function handleFinished(): Promise<void> {
  const { repeatMode } = usePlayback.getState();

  let next: (() => Promise<void>) | null = null;
  if (repeatMode === 'one' && repeatForCurrent > 0) {
    repeatForCurrent -= 1;
    next = playCurrent;
  } else if (index < queue.length - 1) {
    next = () => {
      index += 1;
      resetPerAyahRepeat();
      return playCurrent();
    };
  } else if (repeatMode === 'range' && rangeLoopsRemaining > 0) {
    rangeLoopsRemaining -= 1;
    next = () => {
      index = 0;
      resetPerAyahRepeat();
      return playCurrent();
    };
  }

  if (!next) {
    await stop();
    return;
  }
  await runWithGap(next);
}

/** Insert a silent pause (~ayah length) before continuing, when gap mode is on. */
async function runWithGap(next: () => Promise<void>): Promise<void> {
  const { gapEnabled, gapFactor, speed, set } = usePlayback.getState();
  // The recite-back gap is a per-ayah feature; whole-surah playback skips it.
  if (gapEnabled && !surahMode && lastDurationMs > 0) {
    set({ status: 'gap' });
    await unload(); // free the sound while the user repeats
    const gapMs = Math.round((lastDurationMs / Math.max(speed, 0.25)) * gapFactor);
    await new Promise<void>((resolve) => {
      gapResolve = resolve;
      gapTimer = setTimeout(() => {
        gapTimer = null;
        gapResolve = null;
        resolve();
      }, gapMs);
    });
    // Bail if playback was stopped/paused during the gap.
    if (usePlayback.getState().status !== 'gap') return;
  }
  await next();
}

function resetPerAyahRepeat(): void {
  const { repeatMode, repeatCount } = usePlayback.getState();
  repeatForCurrent = repeatMode === 'one' ? Math.max(0, repeatCount - 1) : 0;
}

async function playCurrent(): Promise<void> {
  const item = queue[index];
  if (!item) {
    await stop();
    return;
  }
  const { reciterId, speed, set } = usePlayback.getState();
  set({ status: 'loading', currentAyahKey: item.key, queueIndex: index });

  await unload();
  const uri = surahMode
    ? await resolveSurahSource(reciterId, item.surah)
    : await resolveAyahSource(reciterId, item.surah, item.ayah);
  const created = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true, rate: speed, shouldCorrectPitch: true },
    onStatus,
  );
  sound = created.sound;
  usePlayback.getState().set({ status: 'playing' });
}

/** Start playing an ordered list of ayat from the beginning. */
export async function playQueue(items: PlayItem[]): Promise<void> {
  if (items.length === 0) return;
  await ensureAudioMode();
  // Sync the active reciter from reader settings at the start of each session.
  const { repeatMode, repeatCount, set } = usePlayback.getState();
  const reciterId = useReaderSettings.getState().preferredReciterId;
  set({ reciterId });
  // Per-surah reciters: collapse the requested ayāt to one item per surah (each
  // item plays a whole-surah file). Per-ayah reciters keep the queue as-is.
  surahMode = isSurahReciter(getReciter(reciterId));
  if (surahMode) {
    const seen = new Set<number>();
    queue = items.filter((it) => (seen.has(it.surah) ? false : (seen.add(it.surah), true)));
  } else {
    queue = items;
  }
  index = 0;
  rangeLoopsRemaining = repeatMode === 'range' ? Math.max(0, repeatCount - 1) : 0;
  resetPerAyahRepeat();
  usePlayback.getState().set({ queue: queue.map((i) => i.key) });
  await playCurrent();
}

/** Convenience: play a single ayah. */
export function playAyah(item: PlayItem): Promise<void> {
  return playQueue([item]);
}

export async function pause(): Promise<void> {
  cancelGap();
  if (sound) await sound.pauseAsync();
  usePlayback.getState().set({ status: 'paused' });
}

export async function resume(): Promise<void> {
  if (sound) {
    await sound.playAsync();
    usePlayback.getState().set({ status: 'playing' });
  } else {
    // Nothing loaded (idle or mid-gap) — (re)play the current queue item.
    if (queue.length) await playCurrent();
  }
}

export async function stop(): Promise<void> {
  cancelGap();
  await unload();
  usePlayback.getState().reset();
}

export async function skipNext(): Promise<void> {
  cancelGap();
  if (index < queue.length - 1) {
    index += 1;
    resetPerAyahRepeat();
    await playCurrent();
  } else {
    await stop();
  }
}

export async function skipPrevious(): Promise<void> {
  cancelGap();
  if (index > 0) {
    index -= 1;
    resetPerAyahRepeat();
    await playCurrent();
  }
}

/** Apply a new playback rate to the live sound (AUD-006). */
export async function applySpeed(speed: number): Promise<void> {
  usePlayback.getState().setSpeed(speed);
  if (sound) await sound.setRateAsync(speed, true);
}
