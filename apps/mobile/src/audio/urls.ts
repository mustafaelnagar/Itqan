/**
 * Ayah audio URL + local cache path helpers.
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { env } from '../config/env';
import { getReciter } from './reciters';
import { cachedAudioUrl } from './webCache';

const pad3 = (n: number) => String(n).padStart(3, '0');

/** Ayah filename in EveryAyah layout, e.g. 67:1 -> "067001.mp3". */
export function ayahFileName(surah: number, ayah: number): string {
  return `${pad3(surah)}${pad3(ayah)}.mp3`;
}

/** Per-surah filename, e.g. surah 67 -> "067.mp3". */
export function surahFileName(surah: number): string {
  return `${pad3(surah)}.mp3`;
}

/**
 * Streaming URL for an ayah from the given reciter. The host is configurable via
 * EXPO_PUBLIC_AUDIO_BASE_URL so deployers can self-host audio (mirroring the
 * `<base>/<reciterFolder>/<sssaaa>.mp3` layout) instead of using a third party.
 */
export function ayahRemoteUrl(reciterId: string, surah: number, ayah: number): string {
  const reciter = getReciter(reciterId);
  return `${env.audioBaseUrl}/${reciter.folder}/${ayahFileName(surah, ayah)}`;
}

/** Directory where downloaded audio for a reciter is cached (AUD-008). */
export function reciterCacheDir(reciterId: string): string {
  return `${FileSystem.documentDirectory}audio/${getReciter(reciterId).folder}/`;
}

/** Local cached file path for an ayah (may or may not exist on disk). */
export function ayahLocalUri(reciterId: string, surah: number, ayah: number): string {
  return `${reciterCacheDir(reciterId)}${ayahFileName(surah, ayah)}`;
}

/** Streaming URL for a whole surah from a per-surah reciter (`<base>/<NNN>.mp3`). */
export function surahRemoteUrl(reciterId: string, surah: number): string {
  const reciter = getReciter(reciterId);
  return `${reciter.surahBaseUrl}/${surahFileName(surah)}`;
}

/** Local cached file path for a whole-surah file. */
export function surahLocalUri(reciterId: string, surah: number): string {
  return `${reciterCacheDir(reciterId)}${surahFileName(surah)}`;
}

/** Resolve the best source for a whole-surah file (cache → stream), like ayah. */
export async function resolveSurahSource(reciterId: string, surah: number): Promise<string> {
  const remote = surahRemoteUrl(reciterId, surah);
  if (Platform.OS === 'web') return cachedAudioUrl(remote);
  if (FileSystem.documentDirectory == null) return remote;
  const info = await FileSystem.getInfoAsync(surahLocalUri(reciterId, surah));
  return info.exists ? surahLocalUri(reciterId, surah) : remote;
}

/**
 * Resolve the best source for an ayah: a downloaded file if present, else the
 * remote stream. Lets playback transparently use offline audio (OFF-002).
 */
export async function resolveAyahSource(
  reciterId: string,
  surah: number,
  ayah: number,
): Promise<string> {
  const remote = ayahRemoteUrl(reciterId, surah, ayah);
  // Web: serve from (and populate) the browser audio cache for offline replay.
  if (Platform.OS === 'web') return cachedAudioUrl(remote);
  // No local filesystem — stream.
  if (FileSystem.documentDirectory == null) return remote;
  const info = await FileSystem.getInfoAsync(ayahLocalUri(reciterId, surah, ayah));
  return info.exists ? ayahLocalUri(reciterId, surah, ayah) : remote;
}
