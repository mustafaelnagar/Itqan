/**
 * i18n entry point.
 *
 * `useT()` returns the active dictionary; `useLocale()` adds direction info.
 * Both read the persisted language store reactively, so changing the language
 * re-renders the whole tree. Quran text is never localized — only the UI.
 */
import { useLanguageSettings } from '../stores/languageSettings';
import { strings, type Dictionary } from './strings';
import { directionFor, isRTL as isRTLForLang, type Direction, type Lang } from './languages';

export type { Lang, Direction, LanguageMeta } from './languages';
export type { Dictionary } from './strings';
export { LANGUAGES, DEFAULT_LANG, recognitionLocale } from './languages';

/** The active UI dictionary. */
export function useT(): Dictionary {
  const lang = useLanguageSettings((s) => s.lang);
  return strings[lang];
}

/** Active language code, text direction, and RTL flag. */
export function useLocale(): { lang: Lang; dir: Direction; isRTL: boolean; t: Dictionary } {
  const lang = useLanguageSettings((s) => s.lang);
  return { lang, dir: directionFor(lang), isRTL: isRTLForLang(lang), t: strings[lang] };
}
