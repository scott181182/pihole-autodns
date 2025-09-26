export function loadEnv<V extends string>(...keys: V[]): Record<V, string> {
    const ret = {} as Record<V, string>;

    for (const key of keys) {
        const value = Bun.env[key];
        if (!value) {
            throw new Error(`Must specify $${key}`);
        }
        ret[key] = value;
    }

    return ret;
}
