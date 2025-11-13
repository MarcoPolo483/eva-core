export interface Telemetry {
  info(msg: string, attrs?: Record<string, unknown>): void;
  warn(msg: string, attrs?: Record<string, unknown>): void;
  error(msg: string, attrs?: Record<string, unknown>): void;
  startSpan<T>(name: string, fn: () => Promise<T>): Promise<T>;
}

// Minimal no-op implementation for tests/runtime defaults.
export const NoopTelemetry: Telemetry = {
  info: () => { },
  warn: () => { },
  error: () => { },
  startSpan: async (_name, fn) => fn()
};