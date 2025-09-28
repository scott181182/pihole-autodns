export class MissingEnvironmentVariableError extends Error {
    public constructor(public readonly key: string) {
        super(`Expected environment variable $${key} to be defined`);
    }
}

export function loadEnvVar(key: string): string {
    const value = Bun.env[key];
    if (!value) {
        throw new MissingEnvironmentVariableError(key);
    }
    return value;
}
