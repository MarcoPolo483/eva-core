export const ok = (value) => ({ ok: true, value });
export const err = (error) => ({ ok: false, error });
export function unwrap(r) {
    if (r.ok)
        return r.value;
    throw r.error;
}
//# sourceMappingURL=result.js.map