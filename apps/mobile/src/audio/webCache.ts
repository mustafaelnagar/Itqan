/**
 * Web offline audio cache (the web counterpart of the native download manager).
 *
 * Stores fetched ayah audio in the browser's Cache Storage so it replays with no
 * network on subsequent plays / offline. Caching needs the audio host to allow
 * cross-origin fetches (CORS) — true for a host you control. If the fetch is
 * blocked or anything fails, we transparently fall back to streaming the original
 * URL through the media element (which does not require CORS), so playback always
 * works; only the offline-caching optimization is skipped.
 */
const CACHE_NAME = 'itqan-audio-v1';

/** True if Cache Storage is usable in this browser context. */
function cachesAvailable(): boolean {
  return typeof caches !== 'undefined';
}

/**
 * Return a playable URL for `remoteUrl`, serving from cache when possible and
 * populating the cache otherwise. Falls back to the remote URL on any failure.
 */
export async function cachedAudioUrl(remoteUrl: string): Promise<string> {
  if (!cachesAvailable()) return remoteUrl;
  try {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(remoteUrl);
    if (!response) {
      const fetched = await fetch(remoteUrl, { mode: 'cors' });
      if (!fetched.ok) return remoteUrl;
      await cache.put(remoteUrl, fetched.clone());
      response = fetched;
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return remoteUrl; // CORS-blocked or offline-and-not-cached → stream directly
  }
}

/** Whether a given ayah URL is already cached for offline playback. */
export async function isAudioCached(remoteUrl: string): Promise<boolean> {
  if (!cachesAvailable()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(remoteUrl)) != null;
  } catch {
    return false;
  }
}

/** Clear all cached web audio. */
export async function clearAudioCache(): Promise<void> {
  if (!cachesAvailable()) return;
  try {
    await caches.delete(CACHE_NAME);
  } catch {
    /* ignore */
  }
}
