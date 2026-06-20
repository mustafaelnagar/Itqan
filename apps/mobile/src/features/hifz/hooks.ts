/**
 * TanStack Query hooks for memorization state (Module 6) and the planner (Module 13).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type AyahRef,
  getDueBuckets,
  getDueCount,
  getDueReviewItems,
  getJuzAggregate,
  getOverallStats,
  getPageAggregate,
  getStatesForSurah,
  getSurahAggregate,
  markAyah,
} from '../../db/repositories/memorizationRepo';
import {
  type CreatePlanInput,
  completePlanItem,
  createPlan,
  getActivePlan,
  getDueItems,
  getPlanProgress,
} from '../../db/repositories/planRepo';
import type { Mark } from './scoring';
import { runSync } from '../../sync/syncService';

export const hifzKeys = {
  statesForSurah: (s: number) => ['memStates', s] as const,
  surahAgg: (s: number) => ['memAgg', 'surah', s] as const,
  pageAgg: (p: number) => ['memAgg', 'page', p] as const,
  juzAgg: (j: number) => ['memAgg', 'juz', j] as const,
  dueCount: ['memDueCount'] as const,
  dueReview: ['memDueReview'] as const,
  dueBuckets: ['memDueBuckets'] as const,
  overall: ['memOverall'] as const,
  activePlan: ['activePlan'] as const,
  dueItems: (planId: string) => ['planDueItems', planId] as const,
  planProgress: (planId: string) => ['planProgress', planId] as const,
};

export const useStatesForSurah = (surah: number) =>
  useQuery({ queryKey: hifzKeys.statesForSurah(surah), queryFn: () => getStatesForSurah(surah) });

export const useSurahAggregate = (surah: number) =>
  useQuery({ queryKey: hifzKeys.surahAgg(surah), queryFn: () => getSurahAggregate(surah) });

export const usePageAggregate = (page: number) =>
  useQuery({ queryKey: hifzKeys.pageAgg(page), queryFn: () => getPageAggregate(page) });

export const useJuzAggregate = (juz: number) =>
  useQuery({ queryKey: hifzKeys.juzAgg(juz), queryFn: () => getJuzAggregate(juz) });

export const useDueCount = () => useQuery({ queryKey: hifzKeys.dueCount, queryFn: getDueCount });

export const useDueReview = (limit = 30) =>
  useQuery({ queryKey: hifzKeys.dueReview, queryFn: () => getDueReviewItems(limit) });

export const useDueBuckets = () =>
  useQuery({ queryKey: hifzKeys.dueBuckets, queryFn: getDueBuckets });

export const useOverallStats = () =>
  useQuery({ queryKey: hifzKeys.overall, queryFn: getOverallStats });

export function useMarkAyah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ayah, mark }: { ayah: AyahRef; mark: Mark }) => markAyah(ayah, mark),
    onSuccess: (state) => {
      void qc.invalidateQueries({ queryKey: hifzKeys.statesForSurah(state.surah) });
      void qc.invalidateQueries({ queryKey: hifzKeys.surahAgg(state.surah) });
      void qc.invalidateQueries({ queryKey: hifzKeys.pageAgg(state.page) });
      void qc.invalidateQueries({ queryKey: hifzKeys.juzAgg(state.juz) });
      void qc.invalidateQueries({ queryKey: hifzKeys.dueCount });
      void qc.invalidateQueries({ queryKey: hifzKeys.dueBuckets });
      void qc.invalidateQueries({ queryKey: hifzKeys.overall });
      void runSync();
    },
  });
}

export const useActivePlan = () =>
  useQuery({ queryKey: hifzKeys.activePlan, queryFn: getActivePlan });

export const useDueItems = (planId: string | undefined) =>
  useQuery({
    queryKey: hifzKeys.dueItems(planId ?? ''),
    queryFn: () => getDueItems(planId as string),
    enabled: !!planId,
  });

export const usePlanProgress = (planId: string | undefined) =>
  useQuery({
    queryKey: hifzKeys.planProgress(planId ?? ''),
    queryFn: () => getPlanProgress(planId as string),
    enabled: !!planId,
  });

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlanInput) => createPlan(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: hifzKeys.activePlan }),
  });
}

export function useCompletePlanItem(planId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => completePlanItem(itemId),
    onSuccess: () => {
      if (planId) {
        void qc.invalidateQueries({ queryKey: hifzKeys.dueItems(planId) });
        void qc.invalidateQueries({ queryKey: hifzKeys.planProgress(planId) });
      }
    },
  });
}
