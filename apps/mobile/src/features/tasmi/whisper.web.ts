/**
 * On-device Whisper ASR for the web build.
 *
 * Records the microphone, then transcribes the audio **fully on-device** with
 * OpenAI Whisper running in WebAssembly via Transformers.js — no audio ever
 * leaves the browser (privacy-first). The model (~tens of MB, quantized) is
 * fetched once from a CDN on first use and cached by the browser for offline
 * reuse thereafter.
 *
 * Transformers.js is loaded at runtime via a dynamic `import()` of its CDN ESM
 * (kept out of the Metro bundle on purpose), so it costs the app nothing until
 * the reciter actually starts a Tasmiʿ session.
 */
import type { WhisperRecorder, WhisperStatus } from './whisper';
export type { WhisperRecorder, WhisperStatus } from './whisper';

/** Multilingual Whisper — `base` balances Arabic accuracy against download size. */
const MODEL = 'Xenova/whisper-base';
const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2';
const SAMPLE_RATE = 16000;

export function whisperAvailable(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined' &&
    audioContextCtor() != null
  );
}

// Runtime ESM import of the CDN module, hidden from Metro/TS static resolution.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamicImport = (url: string): Promise<any> =>
  // eslint-disable-next-line no-eval
  (0, eval)(`import(${JSON.stringify(url)})`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function audioContextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return window.AudioContext ?? (window as any).webkitAudioContext ?? null;
}

// Lazily-loaded ASR pipeline, shared across sessions once warmed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelinePromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPipeline(onProgress?: (p: number) => void): Promise<any> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const tjs = await dynamicImport(TRANSFORMERS_CDN);
      tjs.env.allowLocalModels = false; // models come from the Hub CDN
      return tjs.pipeline('automatic-speech-recognition', MODEL, {
        dtype: 'q8', // quantized — smaller download, fine for recitation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (e: any) => {
          if (e?.status === 'progress' && typeof e.progress === 'number') onProgress?.(e.progress / 100);
        },
      });
    })().catch((err) => {
      pipelinePromise = null; // allow a later retry if the load failed
      throw err;
    });
  }
  return pipelinePromise;
}

/** Decode a recorded blob to mono 16 kHz Float32 PCM — what Whisper expects. */
async function decodeTo16kMono(blob: Blob): Promise<Float32Array> {
  const Ctor = audioContextCtor()!;
  const ctx = new Ctor();
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  await ctx.close();
  const frames = Math.max(1, Math.ceil(decoded.duration * SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, frames, SAMPLE_RATE);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

export async function prewarmWhisper(onProgress?: (p: number) => void): Promise<void> {
  await getPipeline(onProgress);
}

export async function startWhisperRecording(): Promise<WhisperRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: BlobPart[] = [];
  const rec = new MediaRecorder(stream);
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  rec.start();
  const stopTracks = () => stream.getTracks().forEach((tr) => tr.stop());

  return {
    async stopAndTranscribe(onStatus?: (s: WhisperStatus) => void): Promise<string> {
      const stopped = new Promise<void>((res) => {
        rec.onstop = () => res();
      });
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
      await stopped;
      stopTracks();

      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      const audio = await decodeTo16kMono(blob);

      onStatus?.({ phase: 'loading-model' });
      const pipe = await getPipeline((p) => onStatus?.({ phase: 'loading-model', progress: p }));

      onStatus?.({ phase: 'transcribing' });
      const out = await pipe(audio, {
        language: 'arabic',
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = (out as any)?.text;
      return typeof text === 'string' ? text.trim() : '';
    },
    cancel() {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      stopTracks();
    },
  };
}
