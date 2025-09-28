/** Convenience type guard for filtering out null and undefined values. */
export function isTruthy<T>(value: T | null | undefined | 0 | "" | false): value is T {
    return !!value;
}

export interface DiffArrayResult {
    add: Set<string>;
    remove: Set<string>;
}
export function diffArrays(current: string[] | Set<string>, desired: string[] | Set<string>): DiffArrayResult {
    if (Array.isArray(current)) {
        current = new Set(current);
    }
    if (Array.isArray(desired)) {
        desired = new Set(desired);
    }

    return {
        add: desired.difference(current),
        remove: current.difference(desired),
    };
}
