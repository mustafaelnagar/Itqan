// @itqan/quran-data generator.
//
// Fetches verified open Quran data from the AlQuran Cloud API (no key required)
// and writes the bundled JSON the app ships for offline-first reading.
//
//   pnpm --filter @itqan/quran-data generate
//
// Output (packages/quran-data/data/):
//   meta.json                 — version, source, counts, editions
//   surahs.json               — 114 surah records
//   ayahs.json                — 6236 ayah records (Uthmani text + page/juz/sajda)
//   pages.json                — 604 page → first/last ayah key
//   juz.json                  — 30 juz → first/last ayah key
//   translations/en.sahih.json — { "<ayahKey>": text }

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.alquran.cloud/v1';
const TEXT_EDITION = 'quran-uthmani';
const TRANSLATIONS = [{ id: 'en.sahih', language: 'en', name: 'Saheeh International' }];

/** Remove the UTF-8 BOM and any leading/trailing whitespace from edition text. */
const clean = (s) => s.replace(/[﻿​]/g, '').trim();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  const body = await res.json();
  if (body.code !== 200) throw new Error(`GET ${url} -> code ${body.code}`);
  return body.data;
}

function writeJson(relPath, value) {
  const file = join(DATA_DIR, relPath);
  return mkdir(dirname(file), { recursive: true }).then(() =>
    writeFile(file, JSON.stringify(value), 'utf8'),
  );
}

async function main() {
  console.log('Fetching Quran metadata, Uthmani text, and translations…');

  const [meta, uthmani, ...translationEditions] = await Promise.all([
    getJson(`${API}/meta`),
    getJson(`${API}/quran/${TEXT_EDITION}`),
    ...TRANSLATIONS.map((t) => getJson(`${API}/quran/${t.id}`)),
  ]);

  // --- surahs ---
  const surahs = meta.surahs.references.map((s) => ({
    number: s.number,
    nameArabic: s.name,
    nameSimple: s.englishName,
    nameEnglish: s.englishNameTranslation,
    revelationType: s.revelationType.toLowerCase(),
    ayahCount: s.numberOfAyahs,
    bismillahPre: s.number !== 1 && s.number !== 9,
  }));

  // The basmala reference is exactly Al-Fatihah 1:1 (derived to match the
  // edition's exact diacritics). The quran-uthmani edition prepends it to ayah 1
  // of every surah except Al-Fatihah (1) and At-Tawbah (9); we strip it so the
  // basmala can be rendered as a surah header instead of polluting ayah text.
  const basmala = clean(uthmani.surahs[0].ayahs[0].text);

  // --- ayahs (flatten surahs[].ayahs[]) ---
  const ayahs = [];
  for (const surah of uthmani.surahs) {
    for (const a of surah.ayahs) {
      let text = clean(a.text);
      // Strip the leading basmala from ayah 1 (except Al-Fatihah & At-Tawbah).
      if (a.numberInSurah === 1 && surah.number !== 1 && surah.number !== 9) {
        if (text.startsWith(basmala)) text = text.slice(basmala.length).trim();
      }
      ayahs.push({
        key: `${surah.number}:${a.numberInSurah}`,
        surah: surah.number,
        ayah: a.numberInSurah,
        text,
        page: a.page,
        juz: a.juz,
        hizb: Math.ceil(a.hizbQuarter / 4), // hizbQuarter is the rubʿ (1–240); hizb is 1–60
        rub: a.hizbQuarter,
        sajda:
          a.sajda && typeof a.sajda === 'object'
            ? a.sajda.recommended
              ? 'recommended'
              : 'obligatory'
            : null,
      });
    }
  }

  // --- pages & juz boundaries (derive from ayahs) ---
  const boundaries = (field) => {
    const map = new Map();
    for (const a of ayahs) {
      const k = a[field];
      const entry = map.get(k);
      if (!entry) map.set(k, { number: k, firstAyahKey: a.key, lastAyahKey: a.key });
      else entry.lastAyahKey = a.key;
    }
    return [...map.values()].sort((x, y) => x.number - y.number);
  };
  const pages = boundaries('page').map((p) => ({
    ...p,
    juzNumber: ayahs.find((a) => a.key === p.firstAyahKey).juz,
    lineCount: 15,
  }));
  const juz = boundaries('juz');

  // --- translations ---
  for (let i = 0; i < TRANSLATIONS.length; i++) {
    const edition = translationEditions[i];
    const byKey = {};
    for (const surah of edition.surahs) {
      for (const a of surah.ayahs) byKey[`${surah.number}:${a.numberInSurah}`] = clean(a.text);
    }
    await writeJson(`translations/${TRANSLATIONS[i].id}.json`, byKey);
  }

  const metaOut = {
    version: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    source: 'AlQuran Cloud API (api.alquran.cloud)',
    textEdition: TEXT_EDITION,
    editions: TRANSLATIONS,
    counts: { surahs: surahs.length, ayahs: ayahs.length, pages: pages.length, juz: juz.length },
  };

  await writeJson('meta.json', metaOut);
  await writeJson('surahs.json', surahs);
  await writeJson('ayahs.json', ayahs);
  await writeJson('pages.json', pages);
  await writeJson('juz.json', juz);

  console.log('Done:', metaOut.counts);
}

main().catch((err) => {
  console.error('generate failed:', err);
  process.exit(1);
});
