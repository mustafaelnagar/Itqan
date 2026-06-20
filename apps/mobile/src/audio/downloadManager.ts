/**
 * Offline audio downloads + cache management (AUD-007, AUD-008, OFF-002).
 */
import * as FileSystem from 'expo-file-system';
import { logger } from '@itqan/logging';
import { getReciter, isSurahReciter } from './reciters';
import {
  ayahLocalUri,
  ayahRemoteUrl,
  reciterCacheDir,
  surahLocalUri,
  surahRemoteUrl,
} from './urls';

export interface DownloadProgress {
  total: number;
  completed: number;
}

/** Downloads require a filesystem; unavailable on web. */
export const downloadsSupported = FileSystem.documentDirectory != null;

async function ensureDir(dir: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
}

/** Download every ayah of a surah for a reciter, skipping files already cached. */
export async function downloadSurah(
  reciterId: string,
  surah: number,
  ayahCount: number,
  onProgress?: (p: DownloadProgress) => void,
): Promise<void> {
  if (!downloadsSupported) throw new Error('Offline downloads are not available on this platform');
  await ensureDir(reciterCacheDir(reciterId));

  // Per-surah reciters have a single file for the whole surah.
  if (isSurahReciter(getReciter(reciterId))) {
    const local = surahLocalUri(reciterId, surah);
    const info = await FileSystem.getInfoAsync(local);
    if (!info.exists) {
      try {
        await FileSystem.downloadAsync(surahRemoteUrl(reciterId, surah), local);
      } catch (err) {
        logger.captureException(err, { feature: 'audio_download' });
        throw err;
      }
    }
    onProgress?.({ total: 1, completed: 1 });
    return;
  }

  for (let ayah = 1; ayah <= ayahCount; ayah++) {
    const local = ayahLocalUri(reciterId, surah, ayah);
    const info = await FileSystem.getInfoAsync(local);
    if (!info.exists) {
      try {
        await FileSystem.downloadAsync(ayahRemoteUrl(reciterId, surah, ayah), local);
      } catch (err) {
        logger.captureException(err, { feature: 'audio_download' });
        throw err;
      }
    }
    onProgress?.({ total: ayahCount, completed: ayah });
  }
}

/** True when every ayah of the surah is cached for the reciter. */
export async function isSurahDownloaded(
  reciterId: string,
  surah: number,
  ayahCount: number,
): Promise<boolean> {
  if (!downloadsSupported) return false;
  if (isSurahReciter(getReciter(reciterId))) {
    return (await FileSystem.getInfoAsync(surahLocalUri(reciterId, surah))).exists;
  }
  for (let ayah = 1; ayah <= ayahCount; ayah++) {
    const info = await FileSystem.getInfoAsync(ayahLocalUri(reciterId, surah, ayah));
    if (!info.exists) return false;
  }
  return true;
}

/** Total bytes used by downloaded audio across all reciters. */
export async function getCacheSize(): Promise<number> {
  if (!downloadsSupported) return 0;
  const root = `${FileSystem.documentDirectory}audio/`;
  const rootInfo = await FileSystem.getInfoAsync(root);
  if (!rootInfo.exists) return 0;

  let total = 0;
  const folders = await FileSystem.readDirectoryAsync(root);
  for (const folder of folders) {
    const dir = `${root}${folder}/`;
    const files = await FileSystem.readDirectoryAsync(dir);
    for (const file of files) {
      const info = await FileSystem.getInfoAsync(`${dir}${file}`, { size: true });
      if (info.exists && !info.isDirectory) total += info.size ?? 0;
    }
  }
  return total;
}

/** Delete cached audio — for one reciter, or all of it. */
export async function clearCache(reciterId?: string): Promise<void> {
  const target = reciterId ? reciterCacheDir(reciterId) : `${FileSystem.documentDirectory}audio/`;
  const info = await FileSystem.getInfoAsync(target);
  if (info.exists) await FileSystem.deleteAsync(target, { idempotent: true });
}
