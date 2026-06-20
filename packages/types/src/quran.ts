/**
 * Quran content layer — the spine of the app.
 * Mirrors Module 1 entities: surahs, ayahs, words, pages, juz, translations,
 * tafsir, reciters, audio files/segments, mushaf layouts.
 */
import type { AyahKey, ISODateTime, UUID } from './common';

export type RevelationType = 'meccan' | 'medinan';

/** Supported Mushaf rendering scripts. */
export type MushafScript = 'uthmani' | 'indopak' | 'imlaei';

export interface Surah {
  /** 1–114. */
  number: number;
  nameArabic: string;
  nameSimple: string;
  nameEnglish: string;
  revelationType: RevelationType;
  /** Order of revelation (1–114). */
  revelationOrder: number;
  ayahCount: number;
  /** Global ayah index of this surah's first ayah (1-based). */
  bismillahPre: boolean;
}

export interface Ayah {
  key: AyahKey;
  surahNumber: number;
  ayahNumber: number;
  /** Uthmani text by default; alternate scripts via `texts`. */
  textUthmani: string;
  texts?: Partial<Record<MushafScript, string>>;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  /** Sajda marker, if this ayah contains one. */
  sajda?: 'recommended' | 'obligatory';
}

export interface Word {
  id: UUID;
  ayahKey: AyahKey;
  /** 1-based position within the ayah. */
  position: number;
  textUthmani: string;
  transliteration?: string;
  /** Per-word translation (meaning mode). */
  translation?: string;
  /** Triliteral root, when available, for morphology features. */
  root?: string;
  /** Line number on the printed page (for layout rendering). */
  lineNumber?: number;
}

export interface Page {
  number: number;
  juzNumber: number;
  /** First and last ayah keys on the page. */
  firstAyahKey: AyahKey;
  lastAyahKey: AyahKey;
  lineCount: number;
}

export interface Juz {
  number: number;
  firstAyahKey: AyahKey;
  lastAyahKey: AyahKey;
}

export interface Translation {
  id: UUID;
  ayahKey: AyahKey;
  /** Resource id of the translation set (e.g. "en.sahih"). */
  resourceId: string;
  languageCode: string;
  text: string;
}

export interface TafsirEntry {
  id: UUID;
  ayahKey: AyahKey;
  resourceId: string;
  languageCode: string;
  text: string;
}

export interface Reciter {
  id: UUID;
  name: string;
  nameArabic: string;
  style?: 'murattal' | 'mujawwad' | 'muallim';
  /** Base URL or storage prefix for this reciter's audio. */
  audioBaseUrl: string;
}

export interface AudioFile {
  id: UUID;
  reciterId: UUID;
  /** Scope of the file — a whole surah or a single ayah. */
  surahNumber: number;
  url: string;
  durationMs: number;
  format: 'mp3' | 'opus' | 'm4a';
}

/** Word/ayah timestamp segment used for synced highlighting and AI alignment. */
export interface AudioSegment {
  id: UUID;
  audioFileId: UUID;
  ayahKey: AyahKey;
  /** 1-based word position, or null for ayah-level segments. */
  wordPosition: number | null;
  startMs: number;
  endMs: number;
}

/** Printed-page layout metadata for Mushaf-style rendering. */
export interface MushafLayout {
  id: UUID;
  script: MushafScript;
  pageNumber: number;
  lineNumber: number;
  /** Ayah keys (and word ranges) that occupy this line. */
  ayahKey: AyahKey;
  wordStart: number;
  wordEnd: number;
  /** "centered" for surah headers / basmala lines. */
  alignment: 'justified' | 'centered';
}

export interface ContentVersion {
  id: UUID;
  resource: 'quran-text' | 'translation' | 'tafsir' | 'layout' | 'audio';
  version: string;
  publishedAt: ISODateTime;
}
