/**
 * Reciter catalogue (AUD-001).
 *
 * Two hosting shapes:
 *  - **Per-ayah** (default): EveryAyah serves one file per ayah at
 *    `<audioBaseUrl>/<folder>/<sssaaa>.mp3`. Enables per-ayah repeat, the
 *    recite-back gap, and synced highlighting.
 *  - **Per-surah**: when `surahBaseUrl` is set, the reciter is only available as
 *    one MP3 per surah (`<surahBaseUrl>/<NNN>.mp3`). Plays a whole surah at a
 *    time; the per-ayah features above don't apply.
 */
export interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  style: 'murattal' | 'mujawwad' | 'muallim';
  /** EveryAyah data folder (per-ayah) — also used as the offline cache-dir slug. */
  folder: string;
  /** Set for per-surah reciters: absolute base for `<base>/<NNN>.mp3`. */
  surahBaseUrl?: string;
}

/** A reciter whose audio is one file per surah (not per ayah). */
export const isSurahReciter = (r: Reciter): boolean => !!r.surahBaseUrl;

/** The default reciter id (Shaykh Maḥmūd al-Ḥuṣarī, murattal). */
export const DEFAULT_RECITER_ID = 'ar.husary';

export const RECITERS: Reciter[] = [
  {
    id: 'ar.husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    style: 'murattal',
    folder: 'Husary_128kbps',
  },
  {
    id: 'ar.husary.muallim',
    name: 'Al-Husary — Muʿallim (teaching)',
    nameArabic: 'المصحف المعلّم — الشيخ الحصري',
    style: 'muallim',
    folder: 'Husary_Muallim_128kbps',
  },
  {
    id: 'ar.minshawi',
    name: 'Mohamed Siddiq El-Minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    style: 'murattal',
    folder: 'Minshawy_Murattal_128kbps',
  },
  {
    id: 'ar.abdulbasit',
    name: 'Abdul Basit (Murattal)',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'murattal',
    folder: 'Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'ar.albanna',
    name: 'Mahmoud Ali Al-Banna',
    nameArabic: 'محمود علي البنا',
    style: 'murattal',
    // EveryAyah serves al-Bannā at 32 kbps only (no higher-bitrate set exists).
    folder: 'mahmoud_ali_al_banna_32kbps',
  },
  // ── Adding a per-surah reciter (example) ──────────────────────────────────
  // Some reciters have no ayah-by-ayah set on EveryAyah, only one MP3 per surah.
  // Give the entry a `surahBaseUrl` instead of relying on `folder`; the engine
  // then plays whole surahs (per-ayah repeat / gap / synced highlight don't
  // apply). Verify the source returns 200 before committing. Example — Badr
  // al-Turki (NOT shipped by default; ayah-by-ayah is unavailable for him):
  //
  // {
  //   id: 'ar.alturki',
  //   name: 'Badr al-Turki',
  //   nameArabic: 'بدر التركي',
  //   style: 'murattal',
  //   folder: 'bader_alturki', // cache-dir slug only
  //   surahBaseUrl: 'https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem',
  // },
];

const byId = new Map(RECITERS.map((r) => [r.id, r]));

export function getReciter(id: string): Reciter {
  return byId.get(id) ?? RECITERS[0]!;
}
