import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePlayback } from '../stores/playback';
import { pause, resume } from '../audio/player';

/**
 * Desktop/tablet affordance: tap the spacebar to pause or resume playback, the
 * way every media player works. Web-only (physical keyboard); ignores keystrokes
 * while the user is typing in a field, and only acts when a session is active.
 */
export function useSpacebarPlayPause(): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;

      // Don't hijack the spacebar while typing or interacting with a control.
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'BUTTON' ||
        tag === 'SELECT' ||
        el?.isContentEditable
      ) {
        return;
      }

      const { status, currentAyahKey } = usePlayback.getState();
      if (status === 'idle' || !currentAyahKey) return;

      e.preventDefault();
      const isPlaying = status === 'playing' || status === 'gap';
      void (isPlaying ? pause() : resume());
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
