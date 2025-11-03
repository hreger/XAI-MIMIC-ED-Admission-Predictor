import { getValidatedConfig } from '../config/api';

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function withRetry<T>(
    operation: () => Promise<T>,
    options: { retries?: number; backoffMs?: number } = {}
): Promise<T> {
    const config = getValidatedConfig();
    const maxRetries = options.retries ?? config.MAX_RETRIES;
    const backoffMs = options.backoffMs ?? 1000;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries - 1) {
                const delay = backoffMs * Math.pow(2, attempt);
                await sleep(delay);
            }
        }
    }

    throw new ApiError(
        500,
        `Operation failed after ${maxRetries} attempts`,
        lastError
    );
}

export class RateLimiter {
    private timestamps: number[] = [];

    constructor(private windowMs: number, private maxRequests: number) {}

    async waitForAvailability(): Promise<void> {
        const now = Date.now();
        this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);

        if (this.timestamps.length >= this.maxRequests) {
            const oldestTimestamp = this.timestamps[0];
            const waitTime = this.windowMs - (now - oldestTimestamp);
            await sleep(waitTime);
        }

        this.timestamps.push(now);
    }
}