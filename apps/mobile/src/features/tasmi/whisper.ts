/**
 * On-device Whisper ASR (native stub).
 *
 * The real implementation lives in `whisper.web.ts` — it records the mic and runs
 * OpenAI Whisper fully on-device via Transformers.js (WASM), no server, private.
 * Native has no browser audio/WASM stack here, so this is a no-op; Metro picks
 * the right file per platform.
 */
export interface WhisperStatus {
  phase: 'loading-model' | 'transcribing';
  /** Model-download progress 0–1 (loading-model only). */
  progress?: number;
}

export interface WhisperRecorder {
  /** Stop the mic and return the recognized Arabic transcript. */
  stopAndTranscribe(onStatus?: (s: WhisperStatus) => void): Promise<string>;
  /** Abort without transcribing. */
  cancel(): void;
}

/** True when on-device Whisper can run (web with mic + MediaRecorder + WebAudio). */
export function whisperAvailable(): boolean {
  return false;
}

export async function startWhisperRecording(): Promise<WhisperRecorder> {
  throw new Error('On-device Whisper is only available on the web build');
}

/** Optionally pre-download the model ahead of first use. */
export async function prewarmWhisper(): Promise<void> {
  /* no-op on native */
}
