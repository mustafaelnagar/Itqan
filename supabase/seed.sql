-- Minimal dev seed (FND-005). Full Quran import is QUR-002 in R1.
-- Just enough content for the app to render real rows during development.

insert into surahs (number, name_arabic, name_simple, name_english, revelation_type, revelation_order, ayah_count, bismillah_pre)
values
  (1,  'الفاتحة', 'Al-Fatihah', 'The Opening', 'meccan', 5, 7, false),
  (67, 'الملك',   'Al-Mulk',    'The Sovereignty', 'meccan', 77, 30, true)
on conflict (number) do nothing;

insert into juz (number, first_ayah_key, last_ayah_key) values
  (1, '1:1', '2:141'),
  (29, '67:1', '77:50')
on conflict (number) do nothing;

insert into pages (number, juz_number, first_ayah_key, last_ayah_key, line_count) values
  (1, 1, '1:1', '1:7', 7),
  (562, 29, '67:1', '67:12', 15)
on conflict (number) do nothing;

insert into ayahs (ayah_key, surah_number, ayah_number, text_uthmani, page_number, juz_number, hizb_number, rub_number) values
  ('1:1', 1, 1, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 1, 1, 1, 1),
  ('1:2', 1, 2, 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 1, 1, 1, 1),
  ('67:1', 67, 1, 'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ', 562, 29, 57, 225),
  ('67:2', 67, 2, 'ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا', 562, 29, 57, 225)
on conflict (ayah_key) do nothing;

insert into reciters (name, name_arabic, style, audio_base_url) values
  ('Mishary Rashid Alafasy', 'مشاري راشد العفاسي', 'murattal', 'https://cdn.example.com/alafasy/')
on conflict do nothing;
