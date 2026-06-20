/**
 * @itqan/logging — provider-agnostic error logging & breadcrumb API.
 *
 * The app/backend wire a concrete transport (Sentry, console, etc.) at startup via
 * `configureLogger`. Privacy rule (Section 19): never log Quran recordings, raw
 * audio, or personally identifying recitation content. Scrub before reporting.
 */

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

export interface LogContext {
  /** Pseudonymous user id only — never names, emails, or audio. */
  userId?: string;
  feature?: string;
  [key: string]: unknown;
}

export interface LoggerTransport {
  captureException(error: unknown, context?: LogContext): void;
  captureMessage(message: string, level: LogLevel, context?: LogContext): void;
  addBreadcrumb(message: string, data?: Record<string, unknown>): void;
  setUser(userId: string | null): void;
}

/** Default transport: structured console output. Replaced in production by Sentry. */
const consoleTransport: LoggerTransport = {
  captureException(error, context) {
    // eslint-disable-next-line no-console
    console.error('[itqan]', error, context ?? {});
  },
  captureMessage(message, level, context) {
    const fn = level === 'error' || level === 'fatal' ? console.error : console.warn;
    fn('[itqan]', `(${level})`, message, context ?? {});
  },
  addBreadcrumb(message, data) {
    // eslint-disable-next-line no-console
    console.warn('[itqan:breadcrumb]', message, data ?? {});
  },
  setUser() {
    /* no-op for console */
  },
};

let transport: LoggerTransport = consoleTransport;

/** Wire a concrete transport at app startup. */
export function configureLogger(next: LoggerTransport): void {
  transport = next;
}

export const logger = {
  captureException: (error: unknown, context?: LogContext) =>
    transport.captureException(error, context),
  captureMessage: (message: string, level: LogLevel = 'info', context?: LogContext) =>
    transport.captureMessage(message, level, context),
  breadcrumb: (message: string, data?: Record<string, unknown>) =>
    transport.addBreadcrumb(message, data),
  setUser: (userId: string | null) => transport.setUser(userId),
};
