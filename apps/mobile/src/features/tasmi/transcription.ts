/**
 * Transcription — "the ear" (Module 9, pluggable).
 *
 * The deterministic mistake engine (engine.ts) is what matters and is fully
 * offline; this layer only turns recited audio into text. Today the web build
 * uses the browser's built-in SpeechRecognition (Arabic) — zero bundle, but it
 * relies on the platform's recognizer (online in most browsers). The interface
 * is deliberately small so a fully-offline on-device model (e.g. Whisper-wasm)
 * or a self-hosted server can be slotted in without touching the engine or UI.
 */
import { Platform } from 'react-native';
import { whisperAvailable } from './whisper';

export interface TranscriptionInfo {
  supported: boolean;
  /** Identifier persisted with the session (e.g. 'web-speech', 'whisper-web'). */
  source: string;
  /** True if the recognizer may use the network for each recitation. */
  online: boolean;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
  /** Index of the first result that changed in this event (cumulative results). */
  resultIndex: number;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Whether the browser's live (streaming) dictation is available for previews. */
export function liveDictationAvailable(): boolean {
  return getRecognitionCtor() != null;
}

export function transcriptionInfo(): TranscriptionInfo {
  // Prefer on-device Whisper: private, offline after the one-time model download,
  // and far more accurate on Quranic Arabic than the browser recognizer.
  if (whisperAvailable()) return { supported: true, source: 'whisper-web', online: false };
  const supported = getRecognitionCtor() != null;
  return { supported, source: supported ? 'web-speech' : 'unavailable', online: true };
}

export interface DictationSession {
  /** Stop and resolve with the final recognized transcript. */
  stop(): Promise<string>;
  /** Abort without resolving a transcript. */
  cancel(): void;
}

/**
 * Begin live dictation. `onInterim` streams partial text for UI feedback.
 * Throws if transcription is unsupported on this platform.
 */
export function startDictation(
  onInterim?: (text: string) => void,
  lang = 'ar-SA',
): DictationSession {
  const Ctor = getRecognitionCtor();
  if (!Ctor) throw new Error('Speech recognition is not available on this platform');

  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;

  let finalText = '';
  let stopped = false; // the user asked to stop — don't auto-restart
  let resolveStop: ((t: string) => void) | null = null;
  // Guard against a tight restart loop if the engine keeps ending immediately
  // (e.g. a persistent network error): back off after several rapid restarts.
  let rapidRestarts = 0;
  let lastEnd = 0;

  rec.onresult = (event) => {
    let interim = '';
    // Only walk results from resultIndex — `results` is cumulative, so starting
    // at 0 would re-append every already-final word and duplicate the transcript.
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]!;
      const text = result[0]?.transcript ?? '';
      if (result.isFinal) finalText += text + ' ';
      else interim += text;
    }
    onInterim?.((finalText + interim).trim());
  };

  rec.onerror = (event) => {
    // Permission/service errors are fatal; silence ('no-speech') and 'aborted'
    // are recoverable and handled by the auto-restart in onend.
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      stopped = true;
    }
  };

  const finishStop = () => {
    if (resolveStop) {
      resolveStop(finalText.trim());
      resolveStop = null;
    }
  };

  rec.onend = () => {
    if (stopped) {
      finishStop();
      return;
    }
    // Chromium ends recognition on a pause or a ~60s cap. Restart so a single
    // Tasmiʿ session keeps listening across the natural pauses between ayat.
    const now = Date.now();
    rapidRestarts = now - lastEnd < 400 ? rapidRestarts + 1 : 0;
    lastEnd = now;
    if (rapidRestarts > 6) {
      stopped = true; // something is wrong — stop trying
      return;
    }
    try {
      rec.start();
    } catch {
      /* a start()/end race — a later onend will retry */
    }
  };

  try {
    rec.start();
  } catch {
    /* ignore — onend/onerror will surface any issue */
  }

  return {
    stop: () =>
      new Promise<string>((resolve) => {
        stopped = true;
        resolveStop = resolve;
        try {
          rec.stop();
        } catch {
          finishStop();
        }
        // Safety net: resolve even if onend never fires.
        setTimeout(finishStop, 1200);
      }),
    cancel: () => {
      stopped = true;
      rec.onresult = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    },
  };
}
