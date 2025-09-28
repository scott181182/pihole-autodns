export interface ILogger {
    debug(message: string, extras?: Record<string, unknown>): void;
    info(message: string, extras?: Record<string, unknown>): void;
    warn(message: string, extras?: Record<string, unknown>): void;
    error(message: string, extras?: Record<string, unknown>): void;
}

export class Logger implements ILogger {
    private formatMessage(level: string, message: string, extras?: Record<string, unknown>): string {
        let msg = `${new Date().toISOString()} [${level}] ${message}`;
        if (extras) {
            msg += ` ${JSON.stringify(extras)}`;
        }
        return msg;
    }

    public debug(message: string, extras?: Record<string, unknown>) {
        console.debug(this.formatMessage("DEBUG", message, extras));
    }
    public info(message: string, extras?: Record<string, unknown>) {
        console.info(this.formatMessage("INFO", message, extras));
    }
    public warn(message: string, extras?: Record<string, unknown>) {
        console.warn(this.formatMessage("WARN", message, extras));
    }
    public error(message: string, extras?: Record<string, unknown>) {
        console.error(this.formatMessage("ERROR", message, extras));
    }
}
