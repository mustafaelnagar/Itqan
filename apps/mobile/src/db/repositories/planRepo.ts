/**
 * Hifz planner (Module 13). Turns a goal into daily ayah assignments and tracks
 * completion. Local-first; a single plan is "active" at a time for the home screen.
 */
import type { HifzPlanType } from '@itqan/types';
import { getDb } from '../database';
import { getScopeAyahRefs, type PlanScopeType } from './quranRepo';

export interface HifzPlanRow {
  id: string;
  type: HifzPlanType;
  title: string;
  scopeType: PlanScopeType;
  scopeId: string;
  startDate: string;
  endDate: string | null;
  dailyCapacity: number;
  active: boolean;
  createdAt: string;
}

export interface HifzPlanItemRow {
  id: string;
  planId: string;
  scheduledDate: string;
  firstAyahKey: string;
  lastAyahKey: string;
  ayahCount: number;
  kind: 'new_hifz' | 'review';
  completedAt: string | null;
}

export interface CreatePlanInput {
  type: HifzPlanType;
  title: string;
  scopeType: PlanScopeType;
  scopeId: number | null;
  /** Last surah (inclusive) when scopeType is 'surah_range'. */
  scopeIdEnd?: number | null;
  /**
   * For a single-surah plan, an optional ayah sub-range to memorize. Omit both to
   * cover the whole surah (the default — every ayah of the surah is included).
   */
  ayahStart?: number | null;
  ayahEnd?: number | null;
  dailyCapacity: number;
  /**
   * How a day's portion is measured:
   *  - 'ayah'  → `dailyCapacity` ayāt per day (default)
   *  - 'page'  → `dailyCapacity` Mushaf pages per day
   *  - 'mixed' → a whole short surah (≤1 page) per day, else one page/day
   */
  unit?: 'ayah' | 'page' | 'mixed';
  /** Date-only ISO, defaults to today. */
  startDate?: string;
}

const todayISODate = () => new Date().toISOString().slice(0, 10);
const addDays = (isoDate: string, days: number) =>
  new Date(new Date(`${isoDate}T00:00:00Z`).getTime() + days * 86400000).toISOString().slice(0, 10);

/** Split an ordered list into runs that share the same key value (page/surah). */
function groupConsecutive<T>(items: T[], keyOf: (item: T) => number): T[][] {
  const groups: T[][] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && keyOf(last[last.length - 1]!) === keyOf(item)) last.push(item);
    else groups.push([item]);
  }
  return groups;
}

/** Turn ordered ayah refs into per-day chunks according to the plan's unit. */
function chunkByUnit<T extends { page: number; surah: number }>(
  refs: T[],
  unit: 'ayah' | 'page' | 'mixed',
  capacity: number,
): T[][] {
  if (unit === 'page') {
    // `capacity` Mushaf pages per day.
    const pages = groupConsecutive(refs, (r) => r.page);
    const days: T[][] = [];
    for (let i = 0; i < pages.length; i += capacity) days.push(pages.slice(i, i + capacity).flat());
    return days;
  }
  if (unit === 'mixed') {
    // A short surah (fits on one page) lands whole in a day; a long surah is
    // split into one Mushaf page per day.
    const days: T[][] = [];
    for (const surah of groupConsecutive(refs, (r) => r.surah)) {
      const pages = groupConsecutive(surah, (r) => r.page);
      if (pages.length <= 1) days.push(surah);
      else for (const page of pages) days.push(page);
    }
    return days;
  }
  // 'ayah' — `capacity` ayāt per day.
  const days: T[][] = [];
  for (let i = 0; i < refs.length; i += capacity) days.push(refs.slice(i, i + capacity));
  return days;
}

/** Create a plan, generate daily items by chunking the scope, and make it active. */
export async function createPlan(input: CreatePlanInput): Promise<string> {
  const db = await getDb();
  const refs = await getScopeAyahRefs(
    input.scopeType,
    input.scopeId,
    input.scopeIdEnd,
    input.ayahStart,
    input.ayahEnd,
  );
  if (refs.length === 0) throw new Error('Plan scope has no ayat');

  // A surah range needs both bounds; store them as "lo-hi" in the single scope_id.
  const scopeIdText =
    input.scopeType === 'surah_range'
      ? `${Math.min(input.scopeId ?? 0, input.scopeIdEnd ?? 0)}-${Math.max(input.scopeId ?? 0, input.scopeIdEnd ?? 0)}`
      : input.scopeId === null
        ? ''
        : String(input.scopeId);

  const startDate = input.startDate ?? todayISODate();
  const capacity = Math.max(1, input.dailyCapacity);
  const planId = `plan-${Date.now()}`;

  // Chunk the scope into daily portions by the chosen unit (ayah / page / mixed).
  const chunks = chunkByUnit(refs, input.unit ?? 'ayah', capacity);
  const items: HifzPlanItemRow[] = chunks.map((chunk, day) => {
    const first = chunk[0]!;
    const last = chunk[chunk.length - 1]!;
    return {
      id: `${planId}-${day}`,
      planId,
      scheduledDate: addDays(startDate, day),
      firstAyahKey: first.key,
      lastAyahKey: last.key,
      ayahCount: chunk.length,
      kind: 'new_hifz' as const,
      completedAt: null,
    };
  });
  const endDate = items[items.length - 1]!.scheduledDate;
  const createdAt = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(`UPDATE hifz_plans SET active = 0`);
    await db.runAsync(
      `INSERT INTO hifz_plans (id, type, title, scope_type, scope_id, start_date, end_date, daily_capacity, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        planId,
        input.type,
        input.title,
        input.scopeType,
        scopeIdText,
        startDate,
        endDate,
        capacity,
        createdAt,
      ],
    );
    const stmt = await db.prepareAsync(
      `INSERT INTO hifz_plan_items (id, plan_id, scheduled_date, first_ayah_key, last_ayah_key, ayah_count, kind, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    );
    try {
      for (const it of items) {
        await stmt.executeAsync([
          it.id,
          it.planId,
          it.scheduledDate,
          it.firstAyahKey,
          it.lastAyahKey,
          it.ayahCount,
          it.kind,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });

  return planId;
}

const toPlan = (r: RawPlan): HifzPlanRow => ({
  id: r.id,
  type: r.type as HifzPlanType,
  title: r.title,
  scopeType: r.scope_type as HifzPlanRow['scopeType'],
  scopeId: r.scope_id,
  startDate: r.start_date,
  endDate: r.end_date,
  dailyCapacity: r.daily_capacity,
  active: r.active === 1,
  createdAt: r.created_at,
});

interface RawPlan {
  id: string;
  type: string;
  title: string;
  scope_type: string;
  scope_id: string;
  start_date: string;
  end_date: string | null;
  daily_capacity: number;
  active: number;
  created_at: string;
}

export async function getActivePlan(): Promise<HifzPlanRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<RawPlan>(
    `SELECT * FROM hifz_plans WHERE active = 1 ORDER BY created_at DESC LIMIT 1`,
  );
  return row ? toPlan(row) : null;
}

const toItem = (r: RawItem): HifzPlanItemRow => ({
  id: r.id,
  planId: r.plan_id,
  scheduledDate: r.scheduled_date,
  firstAyahKey: r.first_ayah_key,
  lastAyahKey: r.last_ayah_key,
  ayahCount: r.ayah_count,
  kind: r.kind as 'new_hifz' | 'review',
  completedAt: r.completed_at,
});

interface RawItem {
  id: string;
  plan_id: string;
  scheduled_date: string;
  first_ayah_key: string;
  last_ayah_key: string;
  ayah_count: number;
  kind: string;
  completed_at: string | null;
}

/** Items due today or earlier and not yet completed (carries overdue work forward). */
export async function getDueItems(planId: string): Promise<HifzPlanItemRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RawItem>(
    `SELECT * FROM hifz_plan_items
      WHERE plan_id = ? AND completed_at IS NULL AND scheduled_date <= ?
      ORDER BY scheduled_date ASC`,
    [planId, todayISODate()],
  );
  return rows.map(toItem);
}

export async function getPlanProgress(planId: string): Promise<{ total: number; done: number }> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number; done: number }>(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) AS done
       FROM hifz_plan_items WHERE plan_id = ?`,
    [planId],
  );
  return { total: row?.total ?? 0, done: row?.done ?? 0 };
}

export async function completePlanItem(itemId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE hifz_plan_items SET completed_at = ? WHERE id = ?`, [
    new Date().toISOString(),
    itemId,
  ]);
}

export async function deletePlan(planId: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM hifz_plan_items WHERE plan_id = ?`, [planId]);
    await db.runAsync(`DELETE FROM hifz_plans WHERE id = ?`, [planId]);
  });
}
