import type { ApiError } from './apiUtils';

interface ErrorMetadata {
    timestamp: string;
    url?: string;
    userAgent?: string;
    [key: string]: any;
}

interface ErrorLog {
    message: string;
    code?: string;
    stack?: string;
    metadata: ErrorMetadata;
}

export class ErrorMonitor {
    private static instance: ErrorMonitor;
    private logs: ErrorLog[] = [];
    private readonly maxLogs: number = 1000;

    private constructor() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError(error || new Error(String(message)), {
                source,
                lineno,
                colno,
            });
        };

        window.onunhandledrejection = (event) => {
            this.logError(event.reason, {
                type: 'unhandledRejection',
            });
        };
    }

    public static getInstance(): ErrorMonitor {
        if (!ErrorMonitor.instance) {
            ErrorMonitor.instance = new ErrorMonitor();
        }
        return ErrorMonitor.instance;
    }

    public logError(error: Error | ApiError, additionalMetadata: Record<string, any> = {}) {
        const errorLog: ErrorLog = {
            message: error.message,
            code: error instanceof ApiError ? error.code : undefined,
            stack: error.stack,
            metadata: {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                ...additionalMetadata,
            },
        };

        this.logs.push(errorLog);

        // Trim old logs if exceeding maxLogs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error logged:', errorLog);
        }

        // Here you could add integration with external error monitoring services
        // For example, Sentry, LogRocket, etc.
    }

    public getRecentErrors(limit: number = 10): ErrorLog[] {
        return this.logs.slice(-limit);
    }

    public clearLogs(): void {
        this.logs = [];
    }
}

export const errorMonitor = ErrorMonitor.getInstance();