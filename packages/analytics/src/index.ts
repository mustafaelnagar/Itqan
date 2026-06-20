/**
 * @itqan/analytics — typed, privacy-respecting event emitter.
 */
import type { AnalyticsEventName, PropsFor } from './events';

export * from './events';

export interface AnalyticsSink {
  track(name: string, props: Record<string, unknown>): void;
  identify(userId: string | null): void;
  /** Honor user opt-out (analytics is opt-in/respectful by policy). */
  setEnabled(enabled: boolean): void;
}

/** No-op sink — analytics is OFF until the app wires a real sink and the user consents. */
const noopSink: AnalyticsSink = {
  track() {},
  identify() {},
  setEnabled() {},
};

let sink: AnalyticsSink = noopSink;
let enabled = false;

export function configureAnalytics(next: AnalyticsSink): void {
  sink = next;
}

export function setAnalyticsEnabled(value: boolean): void {
  enabled = value;
  sink.setEnabled(value);
}

/** Type-safe event tracking — name and props must match the schema. */
export function track<N extends AnalyticsEventName>(name: N, props: PropsFor<N>): void {
  if (!enabled) return;
  sink.track(name, props as Record<string, unknown>);
}

export function identify(userId: string | null): void {
  sink.identify(userId);
}
