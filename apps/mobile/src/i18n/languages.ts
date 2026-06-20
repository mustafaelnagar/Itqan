/**
 * Supported app languages and their metadata.
 *
 * Arabic is the default — the language of the Quran. Three of the four
 * (Arabic, Urdu, Persian) are written right-to-left.
 */
export type Lang = 'ar' | 'en' | 'ur' | 'fa';

export type Direction = 'rtl' | 'ltr';

export interface LanguageMeta {
  code: Lang;
  /** Endonym — the language's own name, shown in the picker. */
  nativeName: string;
  /** English name, for accessibility labels. */
  englishName: string;
  dir: Direction;
}

export const DEFAULT_LANG: Lang = 'ar';

export const LANGUAGES: LanguageMeta[] = [
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', dir: 'rtl' },
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', dir: 'rtl' },
];

const DIR_BY_LANG: Record<Lang, Direction> = {
  ar: 'rtl',
  en: 'ltr',
  ur: 'rtl',
  fa: 'rtl',
};

export const directionFor = (lang: Lang): Direction => DIR_BY_LANG[lang];
export const isRTL = (lang: Lang): boolean => DIR_BY_LANG[lang] === 'rtl';

/**
 * BCP-47 locale handed to the browser speech recognizer for Tasmiʿ, derived from
 * the selected app language so dictation follows the user's language.
 */
const RECOGNITION_LOCALE: Record<Lang, string> = {
  ar: 'ar-SA',
  en: 'en-US',
  ur: 'ur-PK',
  fa: 'fa-IR',
};

export const recognitionLocale = (lang: Lang): string => RECOGNITION_LOCALE[lang];
