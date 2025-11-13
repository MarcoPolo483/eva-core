// Minimal no-op implementation for tests/runtime defaults.
export const NoopTelemetry = {
    info: () => { },
    warn: () => { },
    error: () => { },
    startSpan: async (_name, fn) => fn()
};
//# sourceMappingURL=telemetry.js.map