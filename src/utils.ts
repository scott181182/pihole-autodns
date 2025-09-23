import type { Logger } from "./logger";



/** Convenience type guard for filtering out null and undefined values. */
export function isTruthy<T>(value: T | null | undefined | 0 | "" | false): value is T {
    return !!value;
}



export async function waitForFileToExist(file: Bun.BunFile, period: number, maxTries: number, logger: Logger): Promise<void> {
    if(await file.exists()) {
        return;
    }

    for(let i = 0; i < maxTries; i++) {
        logger.info(`File '${file.name}' does not exists. Trying again in ${period}ms (#${i + 1})...`);
        await Bun.sleep(period);
        if(await file.exists()) {
            logger.info("    Found it!");
            return;
        }
    }

    throw new Error(`Could not find file '${file.name}' after ${maxTries} attempts`);
}



export interface DiffArrayResult {
    add: Set<string>;
    remove: Set<string>;
}
export function diffArrays(current: string[] | Set<string>, desired: string[] | Set<string>): DiffArrayResult {
    if(Array.isArray(current)) { current = new Set(current); }
    if(Array.isArray(desired)) { desired = new Set(desired); }

    return {
        add: desired.difference(current),
        remove: current.difference(desired),
    };
}
