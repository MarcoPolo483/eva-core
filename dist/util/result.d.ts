export type Ok<T> = {
    ok: true;
    value: T;
};
export type Err<E = Error> = {
    ok: false;
    error: E;
};
export type Result<T, E = Error> = Ok<T> | Err<E>;
export declare const ok: <T>(value: T) => Ok<T>;
export declare const err: <E = Error>(error: E) => Err<E>;
export declare function unwrap<T, E = Error>(r: Result<T, E>): T;
//# sourceMappingURL=result.d.ts.map