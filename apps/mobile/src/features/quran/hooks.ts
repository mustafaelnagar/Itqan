/**
 * TanStack Query hooks over the local SQLite repositories. Content is local-only
 * (offline-first), so these are effectively cached DB reads with React ergonomics.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSurah,
  getSurahAyahs,
  getSurahs,
  getPageAyahs,
  searchAyahs,
} from '../../db/repositories/quranRepo';
import { isBookmarked, listBookmarks, toggleBookmark } from '../../db/repositories/bookmarkRepo';
import { runSync } from '../../sync/syncService';

const HOUR = 1000 * 60 * 60;

export const queryKeys = {
  surahs: ['surahs'] as const,
  surah: (n: number) => ['surah', n] as const,
  surahAyahs: (surah: number, edition: string | null) => ['surahAyahs', surah, edition] as const,
  pageAyahs: (page: number, edition: string | null) => ['pageAyahs', page, edition] as const,
  search: (q: string, edition: string) => ['search', q, edition] as const,
  bookmarks: ['bookmarks'] as const,
  isBookmarked: (ayahKey: string) => ['isBookmarked', ayahKey] as const,
};

export function useSurahs() {
  return useQuery({ queryKey: queryKeys.surahs, queryFn: getSurahs, staleTime: 24 * HOUR });
}

export function useSurah(number: number) {
  return useQuery({ queryKey: queryKeys.surah(number), queryFn: () => getSurah(number) });
}

export function useSurahAyahs(surah: number, edition: string | null) {
  return useQuery({
    queryKey: queryKeys.surahAyahs(surah, edition),
    queryFn: () => getSurahAyahs(surah, edition ?? undefined),
    staleTime: 24 * HOUR,
  });
}

export function usePageAyahs(page: number, edition: string | null) {
  return useQuery({
    queryKey: queryKeys.pageAyahs(page, edition),
    queryFn: () => getPageAyahs(page, edition ?? undefined),
    staleTime: 24 * HOUR,
  });
}

export function useSearch(query: string, edition: string) {
  return useQuery({
    queryKey: queryKeys.search(query, edition),
    queryFn: () => searchAyahs(query, edition),
    enabled: query.trim().length >= 2,
  });
}

export function useBookmarks() {
  return useQuery({ queryKey: queryKeys.bookmarks, queryFn: listBookmarks });
}

export function useIsBookmarked(ayahKey: string) {
  return useQuery({
    queryKey: queryKeys.isBookmarked(ayahKey),
    queryFn: () => isBookmarked(ayahKey),
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ayahKey: string) => toggleBookmark(ayahKey),
    onSuccess: (_added, ayahKey) => {
      void qc.invalidateQueries({ queryKey: queryKeys.bookmarks });
      void qc.invalidateQueries({ queryKey: queryKeys.isBookmarked(ayahKey) });
      // Opportunistically flush the change to the server (no-op when offline/guest).
      void runSync();
    },
  });
}
