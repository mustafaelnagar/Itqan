/**
 * Audio playback UI state (AUD-002..009). The imperative engine lives in
 * `src/audio/player.ts` and writes here; components read here for highlighting
 * (AUD-009) and transport controls.
 */
import { create } from 'zustand';
import { DEFAULT_RECITER_ID } from '../audio/reciters';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'gap';
export type RepeatMode = 'off' | 'one' | 'range';

interface PlaybackState {
  status: PlaybackStatus;
  /** Ayah key currently sounding (drives synced highlight). */
  currentAyahKey: string | null;
  /** Ordered ayah keys for the active session. */
  queue: string[];
  queueIndex: number;
  repeatMode: RepeatMode;
  /** Times to repeat each ayah (mode 'one') or the whole range (mode 'range'). */
  repeatCount: number;
  speed: number;
  reciterId: string;
  /** AUD-011: insert a silent pause after each ayah for the user to repeat. */
  gapEnabled: boolean;
  /** Pause length as a multiple of the ayah's audio duration. */
  gapFactor: number;

  set: (patch: Partial<PlaybackState>) => void;
  reset: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setRepeatCount: (count: number) => void;
  setSpeed: (speed: number) => void;
  toggleGap: () => void;
}

const initial = {
  status: 'idle' as PlaybackStatus,
  currentAyahKey: null,
  queue: [] as string[],
  queueIndex: 0,
  repeatMode: 'off' as RepeatMode,
  repeatCount: 1,
  speed: 1,
  reciterId: DEFAULT_RECITER_ID,
  gapEnabled: false,
  gapFactor: 1,
};

export const usePlayback = create<PlaybackState>((set) => ({
  ...initial,
  set: (patch) => set(patch),
  // Preserve user preferences (reciter, gap, speed, repeat) across reset.
  reset: () =>
    set((s) => ({
      ...initial,
      reciterId: s.reciterId,
      speed: s.speed,
      repeatMode: s.repeatMode,
      repeatCount: s.repeatCount,
      gapEnabled: s.gapEnabled,
      gapFactor: s.gapFactor,
    })),
  setRepeatMode: (repeatMode) => set({ repeatMode }),
  setRepeatCount: (repeatCount) => set({ repeatCount: Math.max(1, repeatCount) }),
  setSpeed: (speed) => set({ speed }),
  toggleGap: () => set((s) => ({ gapEnabled: !s.gapEnabled })),
}));
