import type { ILogger } from "../src/logger";

export class TestLogger implements ILogger {
    debug(_message: string, _extras?: Record<string, unknown>): void {}
    info(_message: string, _extras?: Record<string, unknown>): void {}
    warn(_message: string, _extras?: Record<string, unknown>): void {}
    error(_message: string, _extras?: Record<string, unknown>): void {}
}
