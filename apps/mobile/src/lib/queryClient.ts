import { QueryClient } from '@tanstack/react-query';

/** Shared TanStack Query client. Offline-friendly defaults (Module 16). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — Quran content rarely changes
      gcTime: 1000 * 60 * 60 * 24, // keep cache a day for offline reads
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
