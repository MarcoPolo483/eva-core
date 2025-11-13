export interface Telemetry {
    info(msg: string, attrs?: Record<string, unknown>): void;
    warn(msg: string, attrs?: Record<string, unknown>): void;
    error(msg: string, attrs?: Record<string, unknown>): void;
    startSpan<T>(name: string, fn: () => Promise<T>): Promise<T>;
}
export declare const NoopTelemetry: Telemetry;
//# sourceMappingURL=telemetry.d.ts.map