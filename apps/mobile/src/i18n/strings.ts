/**
 * UI string dictionaries for the four supported languages.
 *
 * English is the canonical shape (`Dictionary`); every other language must
 * provide the same keys, enforced by the typed `Record<Lang, Dictionary>`.
 * Quran text itself is never translated — only the surrounding interface.
 */
import type { Lang } from './languages';

export interface Dictionary {
  // ── Common ───────────────────────────────────────────────────────────────
  common_change: string;
  common_choose: string;
  common_start: string;
  common_done: string;
  common_finish: string;
  common_loading: string;
  common_try_again: string;
  common_meccan: string;
  common_medinan: string;
  /** "{n} ayāt" */
  ayat_count: (n: number) => string;
  /** "Ayah {n}" / "الآية {n}" — labelled single-ayah reference (n may be pre-localized). */
  ayah_n: (n: number | string) => string;
  /** "Surah {n}" fallback name */
  surah_fallback: (n: number) => string;
  /** "Page {n}" (n may be pre-localized) */
  page_label: (n: number | string) => string;
  /** "Juzʾ {n}" (n may be pre-localized) */
  juz_label: (n: number | string) => string;

  // ── Bottom-tab labels ──────────────────────────────────────────────────────
  tab_home: string;
  tab_mushaf: string;
  tab_hifz: string;
  tab_tasmi: string;
  tab_profile: string;

  // ── Onboarding ───────────────────────────────────────────────────────────────
  onboarding_welcome: string;
  onboarding_tagline: string;
  onboarding_choose_language: string;
  onboarding_language_hint: string;
  onboarding_continue: string;

  // ── Home ───────────────────────────────────────────────────────────────────
  home_greeting: string;
  home_due: (n: number) => string;
  home_continue_plan: (title: string) => string;
  home_set_goal: string;
  home_stat_memorized: string;
  home_stat_weak: string;
  home_stat_due: string;
  home_start_hifz: string;
  home_choose_path: string;
  home_continue_reading: string;
  home_ayah: (n: number) => string;
  mode_mushaf_title: string;
  mode_mushaf_subtitle: string;
  mode_hifz_title: string;
  mode_hifz_subtitle: string;
  mode_tasmi_title: string;
  mode_tasmi_subtitle: string;
  mode_review_title: string;
  mode_review_subtitle: string;

  // ── Profile ──────────────────────────────────────────────────────────────────
  profile_title: string;
  profile_recitation: string;
  profile_reciter: string;
  profile_appearance: string;
  theme_system: string;
  theme_light: string;
  theme_dark: string;
  profile_language: string;
  profile_downloaded_audio: string;
  profile_nothing_downloaded: string;
  profile_clear_audio: string;
  profile_privacy: string;
  profile_privacy_1: string;
  profile_privacy_2: string;
  profile_privacy_3: string;
  profile_view_policy: string;

  // ── Privacy & storage policy + cookie notice ─────────────────────────────────
  policy_title: string;
  policy_intro: string;
  policy_storage_title: string;
  policy_storage_body: string;
  policy_cookies_title: string;
  policy_cookies_body: string;
  policy_retention_title: string;
  policy_retention_body: string;
  policy_control_title: string;
  policy_control_body: string;
  policy_clear_button: string;
  policy_clear_done: string;
  cookie_banner_text: string;
  cookie_banner_accept: string;
  cookie_banner_learn_more: string;

  // ── Reader / search / bookmarks ──────────────────────────────────────────────
  reader_error: string;
  search_title: string;
  search_placeholder: string;
  search_min_chars: string;
  search_searching: string;
  search_no_results: string;
  bookmarks_title: string;
  bookmarks_empty: string;
  picker_choose_reciter: string;
  reciter_full_surah: string;
  picker_choose_surah: string;
  picker_choose_juz: string;
  picker_choose_ayah: string;
  nav_surah: string;
  nav_juz: string;
  nav_ayah: string;

  // ── Hifz Studio ──────────────────────────────────────────────────────────────
  hifz_title: string;
  hifz_memory_health: string;
  hifz_due_today: string;
  hifz_todays_session: string;
  hifz_progress: (done: number, total: number) => string;
  hifz_all_caught_up: string;

  // ── Murājaʿah (daily review) + sabaq/sabqi/manzil tracks ─────────────────────
  hifz_muraja_title: string;
  hifz_muraja_body: (n: number) => string;
  hifz_no_due: string;
  hifz_start_review: string;
  bucket_sabaq: string;
  bucket_sabqi: string;
  bucket_manzil: string;
  review_title: string;
  review_progress: (done: number, total: number) => string;
  review_recall_prompt: string;
  review_show_ayah: string;
  review_grade_prompt: string;
  review_listen: string;
  review_caught_up: string;
  review_complete: string;
  hifz_new_plan: string;
  hifz_start_plan_title: string;
  hifz_start_plan_body: string;
  hifz_create_plan: string;
  hifz_daily_goal: string;
  hifz_memorize_passage: string;
  hifz_overall_progress: string;
  hifz_quran_memorized: string;
  hifz_pct_complete: (pct: number) => string;
  hifz_plan_complete: string;
  session_repeat_lesson: string;
  session_repeating_lesson: string;
  session_repeat_selected: string;
  session_repeat_range_label: string;

  // ── Well-tested Hifz plans (presets) ─────────────────────────────────────────
  plan_well_tested: string;
  plan_well_tested_hint: string;
  plan_per_day: (n: number) => string;
  plan_custom: string;
  preset_juz_amma_title: string;
  preset_juz_amma_desc: string;
  preset_quran_1y_title: string;
  preset_quran_1y_desc: string;
  preset_quran_3y_title: string;
  preset_quran_3y_desc: string;
  preset_quran_5y_title: string;
  preset_quran_5y_desc: string;
  preset_page_day_title: string;
  preset_page_day_desc: string;
  preset_mixed_title: string;
  preset_mixed_desc: string;

  // ── Plan ───────────────────────────────────────────────────────────────────
  plan_title: string;
  plan_goal: string;
  goal_juz_amma: string;
  goal_juz_amma_hint: string;
  goal_surah: string;
  goal_surah_hint: string;
  goal_juz: string;
  goal_juz_hint: string;
  goal_surah_range: string;
  goal_surah_range_hint: string;
  goal_full_quran: string;
  goal_full_quran_hint: string;
  plan_choose_surah: string;
  plan_choose_juz: string;
  plan_from_surah: string;
  plan_to_surah: string;
  plan_new_ayat_per_day: string;
  plan_create: string;
  plan_pick_title: string;
  plan_ready_badge: string;
  plan_ayah_range_label: string;
  plan_whole_surah: string;
  plan_part_surah: string;

  // ── Select passage ──────────────────────────────────────────────────────────
  select_title: string;
  select_surah: string;
  select_from_ayah: string;
  select_to_ayah: string;
  select_start_session: string;

  // ── Hifz session ─────────────────────────────────────────────────────────────
  session_default_title: string;
  session_memorize_layer: string;
  reveal_full: string;
  reveal_hint: string;
  reveal_hidden: string;
  session_listen: (repeats: number) => string;
  session_tip: string;
  session_subtitle: (ayat: number, marked: number) => string;
  mark_weak: string;
  mark_good: string;
  mark_strong: string;

  // ── Tasmiʿ landing ──────────────────────────────────────────────────────────
  tasmi_subtitle: string;
  tasmi_choose_passage: string;
  tasmi_start: string;
  tasmi_unsupported: string;
  tasmi_weak_spots: (n: number) => string;
  tasmi_weak_spots_hint: string;
  tasmi_recent: string;
  tasmi_session_summary: (score: number, notes: number) => string;
  tasmi_disclaimer: string;

  // ── Tasmiʿ record ─────────────────────────────────────────────────────────────
  record_subtitle: string;
  record_intro: string;
  record_start: string;
  record_unsupported: string;
  record_listening: string;
  record_stuck: string;
  record_stop: string;
  record_preparing: string;
  record_loading_model: string;
  record_transcribing: string;
  record_whisper_hint: string;
  record_your_recitation: string;
  legend_different: string;
  legend_missed: string;
  record_notes: string;
  record_recommended: string;
  record_repair_now: string;
  record_disclaimer: string;
  record_repair_title: string;
  record_repair_body: string;
  record_repair_saved: (n: number) => string;
  record_retest: string;
  record_dua: string;
  mistake_missed_word: string;
  mistake_extra_word: string;
  mistake_wrong_word: string;
  mistake_repeated_word: string;
  mistake_skipped_ayah: string;
  mistake_stopped_early: string;
  mistake_wrong_continuation: string;
}

const en: Dictionary = {
  common_change: 'Change',
  common_choose: 'Choose…',
  common_start: 'Start',
  common_done: 'Done',
  common_finish: 'Finish',
  common_loading: 'Loading…',
  common_try_again: 'Try again',
  common_meccan: 'Meccan',
  common_medinan: 'Medinan',
  ayat_count: (n) => `${n} ayāt`,
  ayah_n: (n) => `Ayah ${n}`,
  surah_fallback: (n) => `Surah ${n}`,
  page_label: (n) => `Page ${n}`,
  juz_label: (n) => `Juzʾ ${n}`,

  tab_home: 'Home',
  tab_mushaf: 'Mushaf',
  tab_hifz: 'Hifz',
  tab_tasmi: 'Tasmiʿ',
  tab_profile: 'Profile',

  onboarding_welcome: 'Welcome to Itqān',
  onboarding_tagline: 'Your companion for reading, memorizing, and perfecting the Qur’an',
  onboarding_choose_language: 'Choose your language',
  onboarding_language_hint: 'You can change this anytime from your profile',
  onboarding_continue: 'Continue',

  home_greeting: 'Assalāmu ʿalaykum',
  home_due: (n) => `${n} ayāt due for review today`,
  home_continue_plan: (title) => `Continue your plan: ${title}`,
  home_set_goal: 'Set a Hifz goal to begin your journey',
  home_stat_memorized: 'Memorized',
  home_stat_weak: 'Weak',
  home_stat_due: 'Due',
  home_start_hifz: 'Start today’s Hifz',
  home_choose_path: 'Choose your path',
  home_continue_reading: 'CONTINUE READING',
  home_ayah: (n) => `Ayah ${n}`,
  mode_mushaf_title: 'Mushaf',
  mode_mushaf_subtitle: 'Read & listen',
  mode_hifz_title: 'Hifz Studio',
  mode_hifz_subtitle: 'Memorize',
  mode_tasmi_title: 'Tasmiʿ',
  mode_tasmi_subtitle: 'Test & repair',
  mode_review_title: 'Review',
  mode_review_subtitle: 'Murājaʿah',

  profile_title: 'Profile',
  profile_recitation: 'Recitation',
  profile_reciter: 'Reciter',
  profile_appearance: 'Appearance',
  theme_system: 'System',
  theme_light: 'Light',
  theme_dark: 'Dark',
  profile_language: 'Language',
  profile_downloaded_audio: 'Downloaded audio',
  profile_nothing_downloaded: 'Nothing downloaded yet',
  profile_clear_audio: 'Clear downloaded audio',
  profile_privacy: 'Privacy',
  profile_privacy_1: 'Recordings are private by default',
  profile_privacy_2: 'No ads, no data selling, no public leaderboards',
  profile_privacy_3: 'Analytics is opt-in',
  profile_view_policy: 'Privacy & storage policy',
  policy_title: 'Privacy & storage',
  policy_intro:
    'Itqān runs entirely on your device. Your selections, progress, and recordings stay in your browser — nothing is sent to a server, and there are no ads or trackers.',
  policy_storage_title: 'What we store on your device',
  policy_storage_body:
    'Your language, theme, reciter, reading position, memorization plans and progress are saved in your browser (local storage and a first-party cookie) so the app remembers them next time.',
  policy_cookies_title: 'Cookies',
  policy_cookies_body:
    'We use a single first-party cookie to remember your preferences and that you accepted this notice. It is never shared and is not used for advertising or tracking.',
  policy_retention_title: 'How long it lasts',
  policy_retention_body:
    'Your selections are kept for up to ~400 days and refreshed on each visit, so they persist across sessions — until you clear them or your browser data is removed.',
  policy_control_title: 'Your control',
  policy_control_body:
    'You can remove everything Itqān saved on this device at any time with the button below, or by clearing your browser data.',
  policy_clear_button: 'Clear saved data on this device',
  policy_clear_done: 'Cleared. Reload the page to start fresh.',
  cookie_banner_text:
    'Itqān saves your selections on this device (local storage and a first-party cookie) so it remembers them next time. Nothing is sent to a server.',
  cookie_banner_accept: 'Got it',
  cookie_banner_learn_more: 'Privacy & storage',

  reader_error: 'Couldn’t load this surah. Your library may still be preparing.',
  search_title: 'Search',
  search_placeholder: 'Search Arabic or translation…',
  search_min_chars: 'Type at least two characters to search.',
  search_searching: 'Searching…',
  search_no_results: 'No matching ayat.',
  bookmarks_title: 'Bookmarks',
  bookmarks_empty: 'No bookmarks yet. Tap the bookmark icon on any ayah.',
  picker_choose_reciter: 'Choose reciter',
  reciter_full_surah: 'full surah',
  picker_choose_surah: 'Choose surah',
  picker_choose_juz: 'Jump to juzʾ',
  picker_choose_ayah: 'Jump to ayah',
  nav_surah: 'Surah',
  nav_juz: 'Juzʾ',
  nav_ayah: 'Ayah',

  hifz_title: 'Hifz Studio',
  hifz_memory_health: 'Your memory health',
  hifz_due_today: 'Due today',
  hifz_todays_session: 'Today’s session',
  hifz_progress: (done, total) => `${done}/${total} done`,
  hifz_all_caught_up: 'All caught up — nothing due today. 🌿',
  hifz_muraja_title: 'Daily murājaʿah',
  hifz_muraja_body: (n) => `${n} ayāt due for review`,
  hifz_no_due: 'No reviews due — you’re all caught up. 🌿',
  hifz_start_review: 'Start review',
  bucket_sabaq: 'New · sabaq',
  bucket_sabqi: 'Recent · sabqi',
  bucket_manzil: 'Old · manzil',
  review_title: 'Murājaʿah',
  review_progress: (done, total) => `${done} of ${total}`,
  review_recall_prompt: 'Recite it from memory, then reveal',
  review_show_ayah: 'Show ayah',
  review_grade_prompt: 'How well did you recall it?',
  review_listen: 'Listen',
  review_caught_up: 'No reviews due — you’re all caught up. Mā shāʾ Allāh! 🌿',
  review_complete: 'Review complete — mā shāʾ Allāh! 🌟',
  hifz_new_plan: 'New plan',
  hifz_start_plan_title: 'Start a memorization plan',
  hifz_start_plan_body: 'Choose a goal and Itqān builds a daily schedule you can keep.',
  hifz_create_plan: 'Create a plan',
  hifz_daily_goal: 'Daily goal (ayāt)',
  hifz_memorize_passage: 'Memorize a passage',
  hifz_overall_progress: 'Your progress',
  hifz_quran_memorized: 'of the Qur’an memorized',
  hifz_pct_complete: (pct) => `${pct}% complete`,
  hifz_plan_complete: 'Plan complete — mā shāʾ Allāh! 🌟',
  session_repeat_lesson: 'Repeat whole lesson',
  session_repeating_lesson: 'Looping the whole lesson',
  session_repeat_selected: 'Repeat selected ayāt',
  session_repeat_range_label: 'Ayāt to repeat',

  plan_well_tested: 'Well-tested plans',
  plan_well_tested_hint: 'Proven routines — tap one to start today.',
  plan_per_day: (n) => `≈ ${n} ayāt/day`,
  plan_custom: 'Or build your own',
  preset_juz_amma_title: 'Juzʾ ʿAmma · steady',
  preset_juz_amma_desc: 'The 30th juzʾ at a gentle, sustainable pace — ideal to begin.',
  preset_quran_1y_title: 'Whole Qur’an · 1 year',
  preset_quran_1y_desc: 'Intensive ḥifẓ track — for full-time students of the Qur’an.',
  preset_quran_3y_title: 'Whole Qur’an · 3 years',
  preset_quran_3y_desc: 'The classic balanced pace — new memorization with room to revise.',
  preset_quran_5y_title: 'Whole Qur’an · 5 years',
  preset_quran_5y_desc: 'A relaxed, lifelong-friendly pace that’s easy to keep.',
  preset_page_day_title: 'A page a day',
  preset_page_day_desc: 'Mushaf-paced — one page each day (~604 days for the whole Qur’an).',
  preset_mixed_title: 'Short surah + a page',
  preset_mixed_desc: 'A whole short surah each day, and a page a day through the long surahs.',

  plan_title: 'New Hifz plan',
  plan_goal: 'GOAL',
  goal_juz_amma: 'Juzʾ ʿAmma',
  goal_juz_amma_hint: 'The 30th juzʾ — Sūrah 78–114',
  goal_surah: 'A surah',
  goal_surah_hint: 'Memorize one surah',
  goal_juz: 'A juzʾ',
  goal_juz_hint: 'Memorize a specific juzʾ (1–30)',
  goal_surah_range: 'Range of surahs',
  goal_surah_range_hint: 'Focus on several consecutive surahs',
  goal_full_quran: 'Full Quran',
  goal_full_quran_hint: 'The complete muṣḥaf',
  plan_choose_surah: 'Choose surah…',
  plan_choose_juz: 'Juzʾ number',
  plan_from_surah: 'From',
  plan_to_surah: 'To',
  plan_new_ayat_per_day: 'New ayāt per day',
  plan_create: 'Create plan',
  plan_pick_title: 'Choose a plan',
  plan_ready_badge: '1-tap',
  plan_ayah_range_label: 'Which ayāt to memorize',
  plan_whole_surah: 'Whole surah',
  plan_part_surah: 'Choose a range',

  select_title: 'Select passage',
  select_surah: 'SURAH',
  select_from_ayah: 'From ayah',
  select_to_ayah: 'To ayah',
  select_start_session: 'Start session',

  session_default_title: 'Hifz session',
  session_memorize_layer: 'MEMORIZE LAYER',
  reveal_full: 'Full',
  reveal_hint: 'First word',
  reveal_hidden: 'Hidden',
  session_listen: (repeats) => `Listen · repeat ×${repeats}`,
  session_tip: 'Tip: enable the 🎙 gap in the player to pause after each ayah and recite.',
  session_subtitle: (ayat, marked) => `${ayat} ayāt · ${marked} marked`,
  mark_weak: 'Weak',
  mark_good: 'Good',
  mark_strong: 'Strong',

  tasmi_subtitle: 'Recite from memory and get a gentle, teacher-style diagnosis — then repair.',
  tasmi_choose_passage: 'CHOOSE A PASSAGE',
  tasmi_start: 'Start Tasmiʿ',
  tasmi_unsupported:
    'Live recognition isn’t available in this browser — try Chrome, or use a self-hosted recognizer.',
  tasmi_weak_spots: (n) => `${n} weak spot(s) to repair`,
  tasmi_weak_spots_hint: 'Detected mistakes are saved and scheduled for review.',
  tasmi_recent: 'Recent Tasmiʿ',
  tasmi_session_summary: (score, notes) => `${score}% · ${notes} note(s)`,
  tasmi_disclaimer:
    'The AI is humble and can be wrong — please verify tajweed with a qualified teacher.',

  record_subtitle: 'Recite from memory',
  record_intro:
    'Recite from memory. The page fills in word by word as your voice matches the scripture — skips and repeats are forgiven, and a word only turns red if you linger.',
  record_start: 'Start reciting',
  record_unsupported: 'Live recognition unavailable here',
  record_listening: 'Listening — recite now',
  record_stuck: 'Stuck here — take your time',
  record_stop: 'Stop & see diagnosis',
  record_preparing: 'Preparing your diagnosis…',
  record_loading_model: 'Loading the on-device reciter model… (first time only — then it works offline)',
  record_transcribing: 'Listening to your recitation on-device…',
  record_whisper_hint: 'Recite the whole passage — it’s checked on-device when you stop.',
  record_your_recitation: 'YOUR RECITATION',
  legend_different: 'different',
  legend_missed: 'missed',
  record_notes: 'NOTES',
  record_recommended: 'Recommended',
  record_repair_now: 'Repair these now',
  record_disclaimer: 'I may be wrong — please verify tajweed with a qualified teacher.',
  record_repair_title: 'Repair',
  record_repair_body:
    'The weak ayat are looping with a pause after each — listen, then recite back. When they feel firm, re-test.',
  record_repair_saved: (n) => `${n} ayah(s) saved as weak spots and scheduled for review.`,
  record_retest: 'Re-test from memory',
  record_dua: 'May Allah make it firm in your heart.',
  mistake_missed_word: 'Missed',
  mistake_extra_word: 'Extra word',
  mistake_wrong_word: 'Different word',
  mistake_repeated_word: 'Repeated',
  mistake_skipped_ayah: 'Skipped ayah',
  mistake_stopped_early: 'Stopped early',
  mistake_wrong_continuation: 'Wrong continuation',
};

const ar: Dictionary = {
  common_change: 'تغيير',
  common_choose: 'اختر…',
  common_start: 'ابدأ',
  common_done: 'تم',
  common_finish: 'إنهاء',
  common_loading: 'جارٍ التحميل…',
  common_try_again: 'حاول مرة أخرى',
  common_meccan: 'مكية',
  common_medinan: 'مدنية',
  ayat_count: (n) => `${n} آية`,
  ayah_n: (n) => `الآية ${n}`,
  surah_fallback: (n) => `سورة ${n}`,
  page_label: (n) => `صفحة ${n}`,
  juz_label: (n) => `جزء ${n}`,

  tab_home: 'الرئيسية',
  tab_mushaf: 'المصحف',
  tab_hifz: 'الحفظ',
  tab_tasmi: 'التسميع',
  tab_profile: 'الملف',

  onboarding_welcome: 'مرحبًا بك في إتقان',
  onboarding_tagline: 'رفيقك لقراءة القرآن وحفظه وإتقانه',
  onboarding_choose_language: 'اختر لغتك',
  onboarding_language_hint: 'يمكنك تغييرها في أي وقت من ملفك الشخصي',
  onboarding_continue: 'متابعة',

  home_greeting: 'السلام عليكم',
  home_due: (n) => `${n} آية مستحقة للمراجعة اليوم`,
  home_continue_plan: (title) => `تابع خطتك: ${title}`,
  home_set_goal: 'حدد هدف الحفظ لتبدأ رحلتك',
  home_stat_memorized: 'محفوظ',
  home_stat_weak: 'ضعيف',
  home_stat_due: 'مستحق',
  home_start_hifz: 'ابدأ حفظ اليوم',
  home_choose_path: 'اختر طريقك',
  home_continue_reading: 'متابعة القراءة',
  home_ayah: (n) => `الآية ${n}`,
  mode_mushaf_title: 'المصحف',
  mode_mushaf_subtitle: 'اقرأ واستمع',
  mode_hifz_title: 'استوديو الحفظ',
  mode_hifz_subtitle: 'احفظ',
  mode_tasmi_title: 'التسميع',
  mode_tasmi_subtitle: 'اختبر وأصلح',
  mode_review_title: 'المراجعة',
  mode_review_subtitle: 'مراجعة',

  profile_title: 'الملف الشخصي',
  profile_recitation: 'التلاوة',
  profile_reciter: 'القارئ',
  profile_appearance: 'المظهر',
  theme_system: 'النظام',
  theme_light: 'فاتح',
  theme_dark: 'داكن',
  profile_language: 'اللغة',
  profile_downloaded_audio: 'الصوتيات المحملة',
  profile_nothing_downloaded: 'لم يتم تحميل شيء بعد',
  profile_clear_audio: 'مسح الصوتيات المحملة',
  profile_privacy: 'الخصوصية',
  profile_privacy_1: 'التسجيلات خاصة افتراضيًا',
  profile_privacy_2: 'لا إعلانات، لا بيع للبيانات، لا لوحات صدارة عامة',
  profile_privacy_3: 'التحليلات اختيارية',
  profile_view_policy: 'سياسة الخصوصية والتخزين',
  policy_title: 'الخصوصية والتخزين',
  policy_intro:
    'يعمل إتقان بالكامل على جهازك. تبقى اختياراتك وتقدّمك وتسجيلاتك داخل متصفحك — لا يُرسَل شيء إلى أي خادم، ولا توجد إعلانات أو متعقّبات.',
  policy_storage_title: 'ما الذي نحفظه على جهازك',
  policy_storage_body:
    'تُحفَظ لغتك والمظهر والقارئ وموضع القراءة وخطط الحفظ والتقدّم في متصفحك (التخزين المحلي وملف تعريف ارتباط من الطرف الأول) ليتذكّرها التطبيق في المرة القادمة.',
  policy_cookies_title: 'ملفات تعريف الارتباط (الكوكيز)',
  policy_cookies_body:
    'نستخدم ملف تعريف ارتباط واحدًا من الطرف الأول لتذكّر تفضيلاتك وموافقتك على هذا الإشعار. لا يُشارَك مع أحد ولا يُستخدَم للإعلانات أو التتبّع.',
  policy_retention_title: 'مدة الحفظ',
  policy_retention_body:
    'تُحفَظ اختياراتك حتى نحو ٤٠٠ يوم ويُجدَّد حفظها مع كل زيارة لتبقى عبر الجلسات — حتى تمسحها أو تُحذَف بيانات متصفحك.',
  policy_control_title: 'تحكّمك',
  policy_control_body:
    'يمكنك في أي وقت إزالة كل ما حفظه إتقان على هذا الجهاز عبر الزر أدناه، أو بمسح بيانات متصفحك.',
  policy_clear_button: 'مسح البيانات المحفوظة على هذا الجهاز',
  policy_clear_done: 'تم المسح. أعد تحميل الصفحة للبدء من جديد.',
  cookie_banner_text:
    'يحفظ إتقان اختياراتك على هذا الجهاز (التخزين المحلي وملف تعريف ارتباط من الطرف الأول) ليتذكّرها لاحقًا. لا يُرسَل شيء إلى أي خادم.',
  cookie_banner_accept: 'حسنًا',
  cookie_banner_learn_more: 'الخصوصية والتخزين',

  reader_error: 'تعذّر تحميل هذه السورة. قد تكون مكتبتك قيد التحضير.',
  search_title: 'بحث',
  search_placeholder: 'ابحث في العربية أو الترجمة…',
  search_min_chars: 'اكتب حرفين على الأقل للبحث.',
  search_searching: 'جارٍ البحث…',
  search_no_results: 'لا توجد آيات مطابقة.',
  bookmarks_title: 'الإشارات المرجعية',
  bookmarks_empty: 'لا إشارات مرجعية بعد. اضغط أيقونة الإشارة على أي آية.',
  picker_choose_reciter: 'اختر القارئ',
  reciter_full_surah: 'سورة كاملة',
  picker_choose_surah: 'اختر السورة',
  picker_choose_juz: 'انتقل إلى الجزء',
  picker_choose_ayah: 'انتقل إلى الآية',
  nav_surah: 'السورة',
  nav_juz: 'الجزء',
  nav_ayah: 'الآية',

  hifz_title: 'استوديو الحفظ',
  hifz_memory_health: 'صحة حفظك',
  hifz_due_today: 'مستحق اليوم',
  hifz_todays_session: 'جلسة اليوم',
  hifz_progress: (done, total) => `${done}/${total} مكتمل`,
  hifz_all_caught_up: 'أحسنت — لا شيء مستحق اليوم. 🌿',
  hifz_muraja_title: 'المراجعة اليومية',
  hifz_muraja_body: (n) => `${n} آية مستحقة للمراجعة`,
  hifz_no_due: 'لا مراجعات مستحقة — أنت على ما يُرام. 🌿',
  hifz_start_review: 'ابدأ المراجعة',
  bucket_sabaq: 'جديد · السبق',
  bucket_sabqi: 'قريب · السبقي',
  bucket_manzil: 'قديم · المنزل',
  review_title: 'المراجعة',
  review_progress: (done, total) => `${done} من ${total}`,
  review_recall_prompt: 'استرجعها من حفظك ثم اكشفها',
  review_show_ayah: 'أظهر الآية',
  review_grade_prompt: 'كيف كان استرجاعك لها؟',
  review_listen: 'استمع',
  review_caught_up: 'لا مراجعات مستحقة — أنت على ما يُرام، ما شاء الله! 🌿',
  review_complete: 'اكتملت المراجعة — ما شاء الله! 🌟',
  hifz_new_plan: 'خطة جديدة',
  hifz_start_plan_title: 'ابدأ خطة حفظ',
  hifz_start_plan_body: 'اختر هدفًا وسيبني إتقان جدولًا يوميًا يمكنك الالتزام به.',
  hifz_create_plan: 'أنشئ خطة',
  hifz_daily_goal: 'الهدف اليومي (آيات)',
  hifz_memorize_passage: 'احفظ مقطعًا',
  hifz_overall_progress: 'تقدّمك',
  hifz_quran_memorized: 'من القرآن محفوظ',
  hifz_pct_complete: (pct) => `${pct}٪ مكتمل`,
  hifz_plan_complete: 'اكتملت الخطة — ما شاء الله! 🌟',
  session_repeat_lesson: 'كرر الدرس كاملًا',
  session_repeating_lesson: 'تكرار الدرس كاملًا',
  session_repeat_selected: 'كرر الآيات المحددة',
  session_repeat_range_label: 'الآيات المراد تكرارها',

  plan_well_tested: 'خطط مُجرَّبة',
  plan_well_tested_hint: 'برامج مثبتة — اضغط واحدة لتبدأ اليوم.',
  plan_per_day: (n) => `≈ ${n} آية/يوم`,
  plan_custom: 'أو أنشئ خطتك الخاصة',
  preset_juz_amma_title: 'جزء عمّ · هادئ',
  preset_juz_amma_desc: 'الجزء الثلاثون بوتيرة هادئة ومستدامة — مثالي للبداية.',
  preset_quran_1y_title: 'القرآن كاملًا · سنة',
  preset_quran_1y_desc: 'مسار حفظ مكثّف — لطلاب القرآن المتفرّغين.',
  preset_quran_3y_title: 'القرآن كاملًا · ٣ سنوات',
  preset_quran_3y_desc: 'الوتيرة المتوازنة الكلاسيكية — حفظ جديد مع وقت للمراجعة.',
  preset_quran_5y_title: 'القرآن كاملًا · ٥ سنوات',
  preset_quran_5y_desc: 'وتيرة مريحة يسهل الالتزام بها مدى الحياة.',
  preset_page_day_title: 'صفحة في اليوم',
  preset_page_day_desc: 'على إيقاع المصحف — صفحة كل يوم (~٦٠٤ يوم للمصحف كاملًا).',
  preset_mixed_title: 'سورة قصيرة + صفحة',
  preset_mixed_desc: 'سورة قصيرة كاملة كل يوم، وصفحة في اليوم للسور الطوال.',

  plan_title: 'خطة حفظ جديدة',
  plan_goal: 'الهدف',
  goal_juz_amma: 'جزء عمّ',
  goal_juz_amma_hint: 'الجزء الثلاثون — السور ٧٨–١١٤',
  goal_surah: 'سورة',
  goal_surah_hint: 'احفظ سورة واحدة',
  goal_juz: 'جزء',
  goal_juz_hint: 'احفظ جزءًا محددًا (١–٣٠)',
  goal_surah_range: 'نطاق من السور',
  goal_surah_range_hint: 'ركّز على عدة سور متتالية',
  goal_full_quran: 'القرآن كاملًا',
  goal_full_quran_hint: 'المصحف الكامل',
  plan_choose_surah: 'اختر السورة…',
  plan_choose_juz: 'رقم الجزء',
  plan_from_surah: 'من',
  plan_to_surah: 'إلى',
  plan_new_ayat_per_day: 'آيات جديدة يوميًا',
  plan_create: 'أنشئ الخطة',
  plan_pick_title: 'اختر خطة',
  plan_ready_badge: 'بضغطة',
  plan_ayah_range_label: 'الآيات المراد حفظها',
  plan_whole_surah: 'السورة كاملة',
  plan_part_surah: 'تحديد نطاق',

  select_title: 'اختر المقطع',
  select_surah: 'السورة',
  select_from_ayah: 'من الآية',
  select_to_ayah: 'إلى الآية',
  select_start_session: 'ابدأ الجلسة',

  session_default_title: 'جلسة حفظ',
  session_memorize_layer: 'مستوى الحفظ',
  reveal_full: 'كامل',
  reveal_hint: 'الكلمة الأولى',
  reveal_hidden: 'مخفي',
  session_listen: (repeats) => `استمع · تكرار ×${repeats}`,
  session_tip: 'نصيحة: فعّل وقفة 🎙 في المشغّل للتوقف بعد كل آية وترديدها.',
  session_subtitle: (ayat, marked) => `${ayat} آية · ${marked} مُعلَّمة`,
  mark_weak: 'ضعيف',
  mark_good: 'جيد',
  mark_strong: 'متقن',

  tasmi_subtitle: 'اقرأ من حفظك واحصل على تشخيص لطيف كالمعلّم — ثم أصلح.',
  tasmi_choose_passage: 'اختر مقطعًا',
  tasmi_start: 'ابدأ التسميع',
  tasmi_unsupported:
    'التعرّف المباشر غير متاح في هذا المتصفح — جرّب Chrome، أو استخدم مُعرّفًا ذاتي الاستضافة.',
  tasmi_weak_spots: (n) => `${n} نقطة ضعف للإصلاح`,
  tasmi_weak_spots_hint: 'الأخطاء المكتشفة تُحفظ وتُجدول للمراجعة.',
  tasmi_recent: 'تسميعات حديثة',
  tasmi_session_summary: (score, notes) => `${score}٪ · ${notes} ملاحظة`,
  tasmi_disclaimer: 'الذكاء الاصطناعي متواضع وقد يخطئ — يرجى التحقق من التجويد مع معلّم مؤهّل.',

  record_subtitle: 'اقرأ من حفظك',
  record_intro:
    'اقرأ من حفظك. تمتلئ الصفحة كلمةً كلمة عندما يطابق صوتك النص — التخطّي والتكرار مغفوران، ولا تتحول الكلمة إلى اللون الأحمر إلا إذا تأخّرت.',
  record_start: 'ابدأ التلاوة',
  record_unsupported: 'التعرّف المباشر غير متاح هنا',
  record_listening: 'يستمع — اتلُ الآن',
  record_stuck: 'توقّفت هنا — خذ وقتك',
  record_stop: 'أوقف واعرض التشخيص',
  record_preparing: 'جارٍ تحضير تشخيصك…',
  record_loading_model: 'جارٍ تحميل نموذج التعرّف على الجهاز… (لأول مرة فقط، ثم يعمل دون إنترنت)',
  record_transcribing: 'يُنصت إلى تلاوتك على جهازك…',
  record_whisper_hint: 'اتلُ المقطع كاملًا — سيُراجَع على جهازك عند التوقف.',
  record_your_recitation: 'تلاوتك',
  legend_different: 'مختلفة',
  legend_missed: 'منسية',
  record_notes: 'ملاحظات',
  record_recommended: 'موصى به',
  record_repair_now: 'أصلحها الآن',
  record_disclaimer: 'قد أكون مخطئًا — يرجى التحقق من التجويد مع معلّم مؤهّل.',
  record_repair_title: 'إصلاح',
  record_repair_body:
    'الآيات الضعيفة تُكرَّر مع وقفة بعد كل واحدة — استمع ثم ردِّد. وعندما تثبت، أعد الاختبار.',
  record_repair_saved: (n) => `تم حفظ ${n} آية كنقاط ضعف وجدولتها للمراجعة.`,
  record_retest: 'أعد الاختبار من الحفظ',
  record_dua: 'اللهم اجعله ثابتًا في قلبك.',
  mistake_missed_word: 'منسية',
  mistake_extra_word: 'كلمة زائدة',
  mistake_wrong_word: 'كلمة مختلفة',
  mistake_repeated_word: 'مكررة',
  mistake_skipped_ayah: 'آية متخطاة',
  mistake_stopped_early: 'توقف مبكر',
  mistake_wrong_continuation: 'استكمال خاطئ',
};

const ur: Dictionary = {
  common_change: 'تبدیل کریں',
  common_choose: 'منتخب کریں…',
  common_start: 'شروع',
  common_done: 'مکمل',
  common_finish: 'ختم کریں',
  common_loading: 'لوڈ ہو رہا ہے…',
  common_try_again: 'دوبارہ کوشش کریں',
  common_meccan: 'مکی',
  common_medinan: 'مدنی',
  ayat_count: (n) => `${n} آیات`,
  ayah_n: (n) => `آیت ${n}`,
  surah_fallback: (n) => `سورہ ${n}`,
  page_label: (n) => `صفحہ ${n}`,
  juz_label: (n) => `پارہ ${n}`,

  tab_home: 'ہوم',
  tab_mushaf: 'مصحف',
  tab_hifz: 'حفظ',
  tab_tasmi: 'تسمیع',
  tab_profile: 'پروفائل',

  onboarding_welcome: 'اتقان میں خوش آمدید',
  onboarding_tagline: 'قرآن پڑھنے، یاد کرنے اور اسے متقن بنانے میں آپ کا ساتھی',
  onboarding_choose_language: 'اپنی زبان منتخب کریں',
  onboarding_language_hint: 'آپ اسے کسی بھی وقت اپنے پروفائل سے تبدیل کر سکتے ہیں',
  onboarding_continue: 'جاری رکھیں',

  home_greeting: 'السلام علیکم',
  home_due: (n) => `آج ${n} آیات دہرانے کے لیے باقی ہیں`,
  home_continue_plan: (title) => `اپنا منصوبہ جاری رکھیں: ${title}`,
  home_set_goal: 'اپنے سفر کے آغاز کے لیے حفظ کا ہدف مقرر کریں',
  home_stat_memorized: 'یاد شدہ',
  home_stat_weak: 'کمزور',
  home_stat_due: 'باقی',
  home_start_hifz: 'آج کا حفظ شروع کریں',
  home_choose_path: 'اپنا راستہ چنیں',
  home_continue_reading: 'پڑھنا جاری رکھیں',
  home_ayah: (n) => `آیت ${n}`,
  mode_mushaf_title: 'مصحف',
  mode_mushaf_subtitle: 'پڑھیں اور سنیں',
  mode_hifz_title: 'حفظ اسٹوڈیو',
  mode_hifz_subtitle: 'یاد کریں',
  mode_tasmi_title: 'تسمیع',
  mode_tasmi_subtitle: 'آزمائیں اور درست کریں',
  mode_review_title: 'مراجعہ',
  mode_review_subtitle: 'دہرائی',

  profile_title: 'پروفائل',
  profile_recitation: 'تلاوت',
  profile_reciter: 'قاری',
  profile_appearance: 'ظاہری شکل',
  theme_system: 'سسٹم',
  theme_light: 'روشن',
  theme_dark: 'تاریک',
  profile_language: 'زبان',
  profile_downloaded_audio: 'ڈاؤن لوڈ شدہ آڈیو',
  profile_nothing_downloaded: 'ابھی تک کچھ ڈاؤن لوڈ نہیں ہوا',
  profile_clear_audio: 'ڈاؤن لوڈ شدہ آڈیو صاف کریں',
  profile_privacy: 'رازداری',
  profile_privacy_1: 'ریکارڈنگز پہلے سے نجی ہیں',
  profile_privacy_2: 'کوئی اشتہار نہیں، ڈیٹا کی فروخت نہیں، عوامی لیڈر بورڈ نہیں',
  profile_privacy_3: 'تجزیات رضاکارانہ ہیں',
  profile_view_policy: 'پرائیویسی اور اسٹوریج پالیسی',
  policy_title: 'پرائیویسی اور اسٹوریج',
  policy_intro:
    'اِتقان مکمل طور پر آپ کے آلے پر چلتا ہے۔ آپ کے انتخابات، پیش رفت اور ریکارڈنگز آپ کے براؤزر میں رہتی ہیں — کچھ بھی سرور پر نہیں بھیجا جاتا، نہ اشتہار نہ ٹریکر۔',
  policy_storage_title: 'ہم آپ کے آلے پر کیا محفوظ کرتے ہیں',
  policy_storage_body:
    'آپ کی زبان، تھیم، قاری، پڑھنے کی جگہ، حفظ کے منصوبے اور پیش رفت آپ کے براؤزر میں (لوکل اسٹوریج اور فرسٹ پارٹی کوکی) محفوظ ہوتی ہے تاکہ ایپ اگلی بار یاد رکھے۔',
  policy_cookies_title: 'کوکیز',
  policy_cookies_body:
    'ہم آپ کی ترجیحات اور اس نوٹس کی منظوری یاد رکھنے کے لیے ایک فرسٹ پارٹی کوکی استعمال کرتے ہیں۔ یہ کسی کے ساتھ شیئر نہیں ہوتی اور نہ اشتہار یا ٹریکنگ کے لیے ہے۔',
  policy_retention_title: 'یہ کتنی دیر رہتی ہے',
  policy_retention_body:
    'آپ کے انتخابات تقریباً ۴۰۰ دن تک محفوظ رہتے ہیں اور ہر وزٹ پر تازہ ہوتے ہیں، یوں سیشنز کے درمیان برقرار رہتے ہیں — جب تک آپ انہیں صاف نہ کریں یا براؤزر ڈیٹا نہ ہٹے۔',
  policy_control_title: 'آپ کا اختیار',
  policy_control_body:
    'آپ نیچے دیے گئے بٹن سے، یا براؤزر ڈیٹا صاف کر کے، کسی بھی وقت اِتقان کا اس آلے پر محفوظ سب کچھ ہٹا سکتے ہیں۔',
  policy_clear_button: 'اس آلے پر محفوظ ڈیٹا صاف کریں',
  policy_clear_done: 'صاف ہو گیا۔ نئے سرے سے شروع کرنے کے لیے صفحہ ری لوڈ کریں۔',
  cookie_banner_text:
    'اِتقان آپ کے انتخابات اس آلے پر (لوکل اسٹوریج اور فرسٹ پارٹی کوکی) محفوظ کرتا ہے تاکہ اگلی بار یاد رکھے۔ کچھ بھی سرور پر نہیں بھیجا جاتا۔',
  cookie_banner_accept: 'ٹھیک ہے',
  cookie_banner_learn_more: 'پرائیویسی اور اسٹوریج',

  reader_error: 'یہ سورہ لوڈ نہیں ہو سکی۔ آپ کی لائبریری شاید ابھی تیار ہو رہی ہے۔',
  search_title: 'تلاش',
  search_placeholder: 'عربی یا ترجمہ تلاش کریں…',
  search_min_chars: 'تلاش کے لیے کم از کم دو حروف لکھیں۔',
  search_searching: 'تلاش ہو رہی ہے…',
  search_no_results: 'کوئی مماثل آیت نہیں۔',
  bookmarks_title: 'بُک مارکس',
  bookmarks_empty: 'ابھی کوئی بُک مارک نہیں۔ کسی بھی آیت پر بُک مارک آئیکن دبائیں۔',
  picker_choose_reciter: 'قاری منتخب کریں',
  reciter_full_surah: 'پوری سورت',
  picker_choose_surah: 'سورہ منتخب کریں',
  picker_choose_juz: 'پارے پر جائیں',
  picker_choose_ayah: 'آیت پر جائیں',
  nav_surah: 'سورہ',
  nav_juz: 'پارہ',
  nav_ayah: 'آیت',

  hifz_title: 'حفظ اسٹوڈیو',
  hifz_memory_health: 'آپ کے حفظ کی صحت',
  hifz_due_today: 'آج باقی',
  hifz_todays_session: 'آج کا سیشن',
  hifz_progress: (done, total) => `${done}/${total} مکمل`,
  hifz_all_caught_up: 'سب مکمل — آج کچھ باقی نہیں۔ 🌿',
  hifz_muraja_title: 'روزانہ مراجعہ',
  hifz_muraja_body: (n) => `${n} آیات مراجعہ کے لیے باقی`,
  hifz_no_due: 'کوئی مراجعہ باقی نہیں — سب مکمل۔ 🌿',
  hifz_start_review: 'مراجعہ شروع کریں',
  bucket_sabaq: 'نیا · سبق',
  bucket_sabqi: 'حالیہ · سبقی',
  bucket_manzil: 'پرانا · منزل',
  review_title: 'مراجعہ',
  review_progress: (done, total) => `${total} میں سے ${done}`,
  review_recall_prompt: 'یاد سے پڑھیں، پھر ظاہر کریں',
  review_show_ayah: 'آیت دکھائیں',
  review_grade_prompt: 'آپ کو کتنی اچھی یاد رہی؟',
  review_listen: 'سنیں',
  review_caught_up: 'کوئی مراجعہ باقی نہیں — سب مکمل، ما شاء اللہ! 🌿',
  review_complete: 'مراجعہ مکمل — ما شاء اللہ! 🌟',
  hifz_new_plan: 'نیا منصوبہ',
  hifz_start_plan_title: 'حفظ کا منصوبہ شروع کریں',
  hifz_start_plan_body: 'ایک ہدف چنیں اور اتقان روزانہ کا قابلِ عمل شیڈول بنا دے گا۔',
  hifz_create_plan: 'منصوبہ بنائیں',
  hifz_daily_goal: 'روزانہ کا ہدف (آیات)',
  hifz_memorize_passage: 'ایک حصہ یاد کریں',
  hifz_overall_progress: 'آپ کی پیش رفت',
  hifz_quran_memorized: 'قرآن یاد ہو چکا',
  hifz_pct_complete: (pct) => `${pct}٪ مکمل`,
  hifz_plan_complete: 'منصوبہ مکمل — ما شاء اللہ! 🌟',
  session_repeat_lesson: 'پورا سبق دہرائیں',
  session_repeating_lesson: 'پورا سبق دہرایا جا رہا ہے',
  session_repeat_selected: 'منتخب آیات دہرائیں',
  session_repeat_range_label: 'دہرانے والی آیات',

  plan_well_tested: 'آزمودہ منصوبے',
  plan_well_tested_hint: 'مؤثر معمولات — شروع کرنے کے لیے کسی ایک کو دبائیں۔',
  plan_per_day: (n) => `≈ ${n} آیات/دن`,
  plan_custom: 'یا اپنا منصوبہ بنائیں',
  preset_juz_amma_title: 'پارہ عمّ · مستقل',
  preset_juz_amma_desc: 'تیسواں پارہ نرم، پائیدار رفتار سے — آغاز کے لیے بہترین۔',
  preset_quran_1y_title: 'پورا قرآن · ایک سال',
  preset_quran_1y_desc: 'تیز رفتار حفظ — کل وقتی طلبہ کے لیے۔',
  preset_quran_3y_title: 'پورا قرآن · ۳ سال',
  preset_quran_3y_desc: 'کلاسیکی متوازن رفتار — نیا حفظ اور دہرائی کا وقت۔',
  preset_quran_5y_title: 'پورا قرآن · ۵ سال',
  preset_quran_5y_desc: 'آرام دہ رفتار جسے ہمیشہ نبھانا آسان ہے۔',
  preset_page_day_title: 'روزانہ ایک صفحہ',
  preset_page_day_desc: 'مصحف کی رفتار پر — ہر دن ایک صفحہ (پورے قرآن کے لیے ~۶۰۴ دن)۔',
  preset_mixed_title: 'چھوٹی سورہ + ایک صفحہ',
  preset_mixed_desc: 'ہر دن ایک مکمل چھوٹی سورہ، اور بڑی سورتوں میں روزانہ ایک صفحہ۔',

  plan_title: 'نیا حفظ منصوبہ',
  plan_goal: 'ہدف',
  goal_juz_amma: 'پارہ عمّ',
  goal_juz_amma_hint: 'تیسواں پارہ — سورہ ۷۸–۱۱۴',
  goal_surah: 'ایک سورہ',
  goal_surah_hint: 'ایک سورہ یاد کریں',
  goal_juz: 'ایک پارہ',
  goal_juz_hint: 'کوئی مخصوص پارہ یاد کریں (۱–۳۰)',
  goal_surah_range: 'سورتوں کی حد',
  goal_surah_range_hint: 'کئی متواتر سورتوں پر توجہ دیں',
  goal_full_quran: 'مکمل قرآن',
  goal_full_quran_hint: 'مکمل مصحف',
  plan_choose_surah: 'سورہ منتخب کریں…',
  plan_choose_juz: 'پارہ نمبر',
  plan_from_surah: 'سے',
  plan_to_surah: 'تک',
  plan_new_ayat_per_day: 'روزانہ نئی آیات',
  plan_create: 'منصوبہ بنائیں',
  plan_pick_title: 'منصوبہ منتخب کریں',
  plan_ready_badge: 'ایک کلک',
  plan_ayah_range_label: 'کون سی آیات حفظ کرنی ہیں',
  plan_whole_surah: 'پوری سورت',
  plan_part_surah: 'حد منتخب کریں',

  select_title: 'حصہ منتخب کریں',
  select_surah: 'سورہ',
  select_from_ayah: 'آیت سے',
  select_to_ayah: 'آیت تک',
  select_start_session: 'سیشن شروع کریں',

  session_default_title: 'حفظ سیشن',
  session_memorize_layer: 'حفظ کی سطح',
  reveal_full: 'مکمل',
  reveal_hint: 'پہلا لفظ',
  reveal_hidden: 'پوشیدہ',
  session_listen: (repeats) => `سنیں · تکرار ×${repeats}`,
  session_tip: 'مشورہ: ہر آیت کے بعد رک کر دہرانے کے لیے پلیئر میں 🎙 وقفہ فعال کریں۔',
  session_subtitle: (ayat, marked) => `${ayat} آیات · ${marked} نشان زدہ`,
  mark_weak: 'کمزور',
  mark_good: 'اچھا',
  mark_strong: 'مضبوط',

  tasmi_subtitle: 'حفظ سے تلاوت کریں اور استاد جیسی نرم تشخیص پائیں — پھر درست کریں۔',
  tasmi_choose_passage: 'ایک حصہ منتخب کریں',
  tasmi_start: 'تسمیع شروع کریں',
  tasmi_unsupported:
    'اس براؤزر میں لائیو شناخت دستیاب نہیں — Chrome آزمائیں، یا خود میزبان شناخت کنندہ استعمال کریں۔',
  tasmi_weak_spots: (n) => `${n} کمزور مقامات درست کرنے کے لیے`,
  tasmi_weak_spots_hint: 'پکڑی گئی غلطیاں محفوظ اور مراجعے کے لیے شیڈول کی جاتی ہیں۔',
  tasmi_recent: 'حالیہ تسمیع',
  tasmi_session_summary: (score, notes) => `${score}٪ · ${notes} نوٹ`,
  tasmi_disclaimer:
    'اے آئی عاجز ہے اور غلط ہو سکتا ہے — براہِ کرم تجوید کسی اہل استاد سے تصدیق کریں۔',

  record_subtitle: 'حفظ سے تلاوت کریں',
  record_intro:
    'حفظ سے تلاوت کریں۔ جیسے ہی آپ کی آواز متن سے ملتی ہے صفحہ لفظ بہ لفظ بھرتا جاتا ہے — چھوٹ اور تکرار معاف ہیں، اور لفظ تب ہی سرخ ہوتا ہے جب آپ رُک جائیں۔',
  record_start: 'تلاوت شروع کریں',
  record_unsupported: 'یہاں لائیو شناخت دستیاب نہیں',
  record_listening: 'سن رہا ہے — اب تلاوت کریں',
  record_stuck: 'یہاں رُکے ہیں — اطمینان سے',
  record_stop: 'روکیں اور تشخیص دیکھیں',
  record_preparing: 'آپ کی تشخیص تیار ہو رہی ہے…',
  record_loading_model: 'آلے پر شناخت ماڈل لوڈ ہو رہا ہے… (صرف پہلی بار، پھر آف لائن چلے گا)',
  record_transcribing: 'آپ کی تلاوت آلے پر سنی جا رہی ہے…',
  record_whisper_hint: 'پورا حصہ تلاوت کریں — رکنے پر آلے ہی پر جانچ ہوگی۔',
  record_your_recitation: 'آپ کی تلاوت',
  legend_different: 'مختلف',
  legend_missed: 'چھوٹ گئی',
  record_notes: 'نوٹس',
  record_recommended: 'تجویز کردہ',
  record_repair_now: 'ابھی درست کریں',
  record_disclaimer: 'میں غلط ہو سکتا ہوں — براہِ کرم تجوید کسی اہل استاد سے تصدیق کریں۔',
  record_repair_title: 'درستی',
  record_repair_body:
    'کمزور آیات ہر ایک کے بعد وقفے کے ساتھ دہرائی جا رہی ہیں — سنیں، پھر دہرائیں۔ جب مضبوط ہو جائیں تو دوبارہ آزمائیں۔',
  record_repair_saved: (n) =>
    `${n} آیات کمزور مقامات کے طور پر محفوظ اور مراجعے کے لیے شیڈول ہوئیں۔`,
  record_retest: 'حفظ سے دوبارہ آزمائیں',
  record_dua: 'اللہ اسے آپ کے دل میں مضبوط کرے۔',
  mistake_missed_word: 'چھوٹ گئی',
  mistake_extra_word: 'اضافی لفظ',
  mistake_wrong_word: 'مختلف لفظ',
  mistake_repeated_word: 'دہرایا گیا',
  mistake_skipped_ayah: 'آیت چھوٹ گئی',
  mistake_stopped_early: 'جلد رک گئے',
  mistake_wrong_continuation: 'غلط تسلسل',
};

const fa: Dictionary = {
  common_change: 'تغییر',
  common_choose: 'انتخاب کنید…',
  common_start: 'شروع',
  common_done: 'انجام شد',
  common_finish: 'پایان',
  common_loading: 'در حال بارگذاری…',
  common_try_again: 'دوباره تلاش کنید',
  common_meccan: 'مکی',
  common_medinan: 'مدنی',
  ayat_count: (n) => `${n} آیه`,
  ayah_n: (n) => `آیه ${n}`,
  surah_fallback: (n) => `سوره ${n}`,
  page_label: (n) => `صفحه ${n}`,
  juz_label: (n) => `جزء ${n}`,

  tab_home: 'خانه',
  tab_mushaf: 'مصحف',
  tab_hifz: 'حفظ',
  tab_tasmi: 'تسمیع',
  tab_profile: 'پروفایل',

  onboarding_welcome: 'به اتقان خوش آمدید',
  onboarding_tagline: 'همراه شما برای خواندن، حفظ و اتقان قرآن',
  onboarding_choose_language: 'زبان خود را انتخاب کنید',
  onboarding_language_hint: 'می‌توانید هر زمان از پروفایل خود آن را تغییر دهید',
  onboarding_continue: 'ادامه',

  home_greeting: 'السلام علیکم',
  home_due: (n) => `${n} آیه برای مرور امروز باقی مانده است`,
  home_continue_plan: (title) => `برنامه خود را ادامه دهید: ${title}`,
  home_set_goal: 'برای آغاز سفر خود هدف حفظ تعیین کنید',
  home_stat_memorized: 'حفظ‌شده',
  home_stat_weak: 'ضعیف',
  home_stat_due: 'باقی‌مانده',
  home_start_hifz: 'حفظ امروز را آغاز کنید',
  home_choose_path: 'مسیر خود را انتخاب کنید',
  home_continue_reading: 'ادامه خواندن',
  home_ayah: (n) => `آیه ${n}`,
  mode_mushaf_title: 'مصحف',
  mode_mushaf_subtitle: 'بخوانید و گوش دهید',
  mode_hifz_title: 'استودیوی حفظ',
  mode_hifz_subtitle: 'حفظ کنید',
  mode_tasmi_title: 'تسمیع',
  mode_tasmi_subtitle: 'بیازمایید و اصلاح کنید',
  mode_review_title: 'مرور',
  mode_review_subtitle: 'مرور',

  profile_title: 'پروفایل',
  profile_recitation: 'تلاوت',
  profile_reciter: 'قاری',
  profile_appearance: 'ظاهر',
  theme_system: 'سیستم',
  theme_light: 'روشن',
  theme_dark: 'تیره',
  profile_language: 'زبان',
  profile_downloaded_audio: 'صوت‌های دانلودشده',
  profile_nothing_downloaded: 'هنوز چیزی دانلود نشده است',
  profile_clear_audio: 'پاک کردن صوت‌های دانلودشده',
  profile_privacy: 'حریم خصوصی',
  profile_privacy_1: 'ضبط‌ها به‌صورت پیش‌فرض خصوصی هستند',
  profile_privacy_2: 'بدون تبلیغات، بدون فروش داده، بدون جدول امتیازات عمومی',
  profile_privacy_3: 'تحلیل‌ها اختیاری است',
  profile_view_policy: 'سیاست حریم خصوصی و ذخیره‌سازی',
  policy_title: 'حریم خصوصی و ذخیره‌سازی',
  policy_intro:
    'اتقان کاملاً روی دستگاه شما اجرا می‌شود. انتخاب‌ها، پیشرفت و ضبط‌های شما در مرورگرتان می‌ماند — چیزی به سرور ارسال نمی‌شود و هیچ تبلیغ یا ردیابی وجود ندارد.',
  policy_storage_title: 'چه چیزی روی دستگاه شما ذخیره می‌کنیم',
  policy_storage_body:
    'زبان، پوسته، قاری، محل خواندن، برنامه‌های حفظ و پیشرفت شما در مرورگرتان (حافظهٔ محلی و یک کوکی شخص‌اول) ذخیره می‌شود تا برنامه دفعهٔ بعد آن‌ها را به‌خاطر بسپارد.',
  policy_cookies_title: 'کوکی‌ها',
  policy_cookies_body:
    'ما از یک کوکی شخص‌اول برای به‌خاطر سپردن ترجیحات شما و پذیرش این اعلان استفاده می‌کنیم. با کسی به اشتراک گذاشته نمی‌شود و برای تبلیغات یا ردیابی نیست.',
  policy_retention_title: 'چه مدت باقی می‌ماند',
  policy_retention_body:
    'انتخاب‌های شما تا حدود ۴۰۰ روز نگه داشته و در هر بازدید تازه می‌شود تا میان نشست‌ها باقی بماند — تا زمانی که آن‌ها را پاک کنید یا داده‌های مرورگر حذف شود.',
  policy_control_title: 'کنترل شما',
  policy_control_body:
    'هر زمان می‌توانید همهٔ آنچه اتقان روی این دستگاه ذخیره کرده را با دکمهٔ زیر یا با پاک‌کردن داده‌های مرورگر حذف کنید.',
  policy_clear_button: 'پاک‌کردن داده‌های ذخیره‌شده روی این دستگاه',
  policy_clear_done: 'پاک شد. برای شروع دوباره صفحه را بارگذاری کنید.',
  cookie_banner_text:
    'اتقان انتخاب‌های شما را روی این دستگاه (حافظهٔ محلی و یک کوکی شخص‌اول) ذخیره می‌کند تا دفعهٔ بعد به‌خاطر بسپارد. چیزی به سرور ارسال نمی‌شود.',
  cookie_banner_accept: 'متوجه شدم',
  cookie_banner_learn_more: 'حریم خصوصی و ذخیره‌سازی',

  reader_error: 'بارگذاری این سوره ممکن نشد. کتابخانه شما شاید هنوز در حال آماده‌سازی است.',
  search_title: 'جستجو',
  search_placeholder: 'در عربی یا ترجمه جستجو کنید…',
  search_min_chars: 'برای جستجو حداقل دو حرف بنویسید.',
  search_searching: 'در حال جستجو…',
  search_no_results: 'آیه‌ای مطابق یافت نشد.',
  bookmarks_title: 'نشانک‌ها',
  bookmarks_empty: 'هنوز نشانکی نیست. روی نماد نشانک هر آیه ضربه بزنید.',
  picker_choose_reciter: 'انتخاب قاری',
  reciter_full_surah: 'کل سوره',
  picker_choose_surah: 'انتخاب سوره',
  picker_choose_juz: 'رفتن به جزء',
  picker_choose_ayah: 'رفتن به آیه',
  nav_surah: 'سوره',
  nav_juz: 'جزء',
  nav_ayah: 'آیه',

  hifz_title: 'استودیوی حفظ',
  hifz_memory_health: 'سلامت حفظ شما',
  hifz_due_today: 'امروز باقی',
  hifz_todays_session: 'جلسه امروز',
  hifz_progress: (done, total) => `${done}/${total} انجام شد`,
  hifz_all_caught_up: 'همه‌چیز به‌روز است — امروز چیزی باقی نمانده. 🌿',
  hifz_muraja_title: 'مرور روزانه',
  hifz_muraja_body: (n) => `${n} آیه برای مرور`,
  hifz_no_due: 'مروری باقی نمانده — همه‌چیز به‌روز است. 🌿',
  hifz_start_review: 'شروع مرور',
  bucket_sabaq: 'نو · سبق',
  bucket_sabqi: 'اخیر · سبقی',
  bucket_manzil: 'قدیم · منزل',
  review_title: 'مرور',
  review_progress: (done, total) => `${done} از ${total}`,
  review_recall_prompt: 'از حفظ بخوانید، سپس آشکار کنید',
  review_show_ayah: 'نمایش آیه',
  review_grade_prompt: 'چقدر خوب به‌خاطر آوردید؟',
  review_listen: 'گوش دادن',
  review_caught_up: 'مروری باقی نمانده — همه‌چیز به‌روز است، ما شاء الله! 🌿',
  review_complete: 'مرور کامل شد — ما شاء الله! 🌟',
  hifz_new_plan: 'برنامه جدید',
  hifz_start_plan_title: 'یک برنامه حفظ آغاز کنید',
  hifz_start_plan_body: 'هدفی انتخاب کنید و اتقان یک برنامه روزانه قابل‌اجرا می‌سازد.',
  hifz_create_plan: 'ساخت برنامه',
  hifz_daily_goal: 'هدف روزانه (آیه)',
  hifz_memorize_passage: 'یک قطعه را حفظ کنید',
  hifz_overall_progress: 'پیشرفت شما',
  hifz_quran_memorized: 'از قرآن حفظ شده',
  hifz_pct_complete: (pct) => `${pct}٪ کامل`,
  hifz_plan_complete: 'برنامه کامل شد — ما شاء الله! 🌟',
  session_repeat_lesson: 'تکرار کل درس',
  session_repeating_lesson: 'در حال تکرار کل درس',
  session_repeat_selected: 'تکرار آیات انتخاب‌شده',
  session_repeat_range_label: 'آیات برای تکرار',

  plan_well_tested: 'برنامه‌های آزموده',
  plan_well_tested_hint: 'روال‌های اثبات‌شده — برای شروع امروز یکی را انتخاب کنید.',
  plan_per_day: (n) => `≈ ${n} آیه/روز`,
  plan_custom: 'یا برنامه خود را بسازید',
  preset_juz_amma_title: 'جزء عمّ · آرام',
  preset_juz_amma_desc: 'جزء سی‌ام با سرعتی آرام و پایدار — ایده‌آل برای شروع.',
  preset_quran_1y_title: 'کل قرآن · یک سال',
  preset_quran_1y_desc: 'مسیر حفظ فشرده — برای طلاب تمام‌وقت قرآن.',
  preset_quran_3y_title: 'کل قرآن · ۳ سال',
  preset_quran_3y_desc: 'سرعت متعادل کلاسیک — حفظ تازه با فرصت مرور.',
  preset_quran_5y_title: 'کل قرآن · ۵ سال',
  preset_quran_5y_desc: 'سرعتی آرام که نگه‌داشتنش برای همیشه آسان است.',
  preset_page_day_title: 'یک صفحه در روز',
  preset_page_day_desc: 'هم‌گام با مصحف — هر روز یک صفحه (~۶۰۴ روز برای کل قرآن).',
  preset_mixed_title: 'سوره کوتاه + یک صفحه',
  preset_mixed_desc: 'هر روز یک سوره کوتاه کامل، و برای سوره‌های بلند روزی یک صفحه.',

  plan_title: 'برنامه حفظ جدید',
  plan_goal: 'هدف',
  goal_juz_amma: 'جزء عمّ',
  goal_juz_amma_hint: 'جزء سی‌ام — سوره‌های ۷۸–۱۱۴',
  goal_surah: 'یک سوره',
  goal_surah_hint: 'یک سوره را حفظ کنید',
  goal_juz: 'یک جزء',
  goal_juz_hint: 'یک جزء مشخص را حفظ کنید (۱–۳۰)',
  goal_surah_range: 'محدوده‌ای از سوره‌ها',
  goal_surah_range_hint: 'روی چند سوره پیاپی تمرکز کنید',
  goal_full_quran: 'کل قرآن',
  goal_full_quran_hint: 'مصحف کامل',
  plan_choose_surah: 'انتخاب سوره…',
  plan_choose_juz: 'شماره جزء',
  plan_from_surah: 'از',
  plan_to_surah: 'تا',
  plan_new_ayat_per_day: 'آیه‌های جدید در روز',
  plan_create: 'ساخت برنامه',
  plan_pick_title: 'یک برنامه انتخاب کنید',
  plan_ready_badge: 'یک‌ضربه',
  plan_ayah_range_label: 'کدام آیات حفظ شود',
  plan_whole_surah: 'تمام سوره',
  plan_part_surah: 'انتخاب محدوده',

  select_title: 'انتخاب قطعه',
  select_surah: 'سوره',
  select_from_ayah: 'از آیه',
  select_to_ayah: 'تا آیه',
  select_start_session: 'شروع جلسه',

  session_default_title: 'جلسه حفظ',
  session_memorize_layer: 'لایه حفظ',
  reveal_full: 'کامل',
  reveal_hint: 'کلمه اول',
  reveal_hidden: 'پنهان',
  session_listen: (repeats) => `گوش دادن · تکرار ×${repeats}`,
  session_tip: 'نکته: مکث 🎙 را در پخش‌کننده فعال کنید تا پس از هر آیه مکث کند و تکرار کنید.',
  session_subtitle: (ayat, marked) => `${ayat} آیه · ${marked} علامت‌گذاری‌شده`,
  mark_weak: 'ضعیف',
  mark_good: 'خوب',
  mark_strong: 'قوی',

  tasmi_subtitle: 'از حفظ تلاوت کنید و تشخیصی ملایم و معلم‌گونه بگیرید — سپس اصلاح کنید.',
  tasmi_choose_passage: 'یک قطعه انتخاب کنید',
  tasmi_start: 'شروع تسمیع',
  tasmi_unsupported:
    'تشخیص زنده در این مرورگر در دسترس نیست — Chrome را امتحان کنید یا از یک تشخیص‌گر خودمیزبان استفاده کنید.',
  tasmi_weak_spots: (n) => `${n} نقطه ضعف برای اصلاح`,
  tasmi_weak_spots_hint: 'خطاهای شناسایی‌شده ذخیره و برای مرور زمان‌بندی می‌شوند.',
  tasmi_recent: 'تسمیع‌های اخیر',
  tasmi_session_summary: (score, notes) => `${score}٪ · ${notes} یادداشت`,
  tasmi_disclaimer:
    'هوش مصنوعی فروتن است و ممکن است اشتباه کند — لطفاً تجوید را با معلمی مجرب بررسی کنید.',

  record_subtitle: 'از حفظ تلاوت کنید',
  record_intro:
    'از حفظ تلاوت کنید. هنگامی که صدای شما با متن مطابقت می‌کند، صفحه کلمه‌به‌کلمه پر می‌شود — پرش و تکرار بخشیده می‌شود و کلمه فقط زمانی قرمز می‌شود که مکث کنید.',
  record_start: 'شروع تلاوت',
  record_unsupported: 'تشخیص زنده اینجا در دسترس نیست',
  record_listening: 'در حال شنیدن — اکنون تلاوت کنید',
  record_stuck: 'اینجا متوقف شدید — با آرامش',
  record_stop: 'توقف و دیدن تشخیص',
  record_preparing: 'در حال آماده‌سازی تشخیص شما…',
  record_loading_model: 'در حال بارگذاری مدل تشخیص روی دستگاه… (فقط بار اول، سپس آفلاین کار می‌کند)',
  record_transcribing: 'در حال شنیدن تلاوت شما روی دستگاه…',
  record_whisper_hint: 'تمام قطعه را تلاوت کنید — هنگام توقف روی دستگاه بررسی می‌شود.',
  record_your_recitation: 'تلاوت شما',
  legend_different: 'متفاوت',
  legend_missed: 'جا افتاده',
  record_notes: 'یادداشت‌ها',
  record_recommended: 'توصیه‌شده',
  record_repair_now: 'همین حالا اصلاح کنید',
  record_disclaimer: 'ممکن است اشتباه کنم — لطفاً تجوید را با معلمی مجرب بررسی کنید.',
  record_repair_title: 'اصلاح',
  record_repair_body:
    'آیه‌های ضعیف با مکثی پس از هر کدام تکرار می‌شوند — گوش دهید، سپس بازخوانی کنید. وقتی استوار شدند، دوباره بیازمایید.',
  record_repair_saved: (n) => `${n} آیه به‌عنوان نقاط ضعف ذخیره و برای مرور زمان‌بندی شد.`,
  record_retest: 'بازآزمایی از حفظ',
  record_dua: 'خداوند آن را در دلت استوار گرداند.',
  mistake_missed_word: 'جا افتاده',
  mistake_extra_word: 'کلمه اضافه',
  mistake_wrong_word: 'کلمه متفاوت',
  mistake_repeated_word: 'تکرارشده',
  mistake_skipped_ayah: 'آیه جا افتاده',
  mistake_stopped_early: 'توقف زودهنگام',
  mistake_wrong_continuation: 'ادامه نادرست',
};

export const strings: Record<Lang, Dictionary> = { ar, en, ur, fa };
