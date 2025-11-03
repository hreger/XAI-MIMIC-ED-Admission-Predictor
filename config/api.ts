import { z } from 'zod';

export const ApiConfig = z.object({
    GEMINI_API_KEY: z.string().min(1, 'API key is required'),
    API_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com'),
    MAX_RETRIES: z.number().int().positive().default(3),
    TIMEOUT_MS: z.number().int().positive().default(30000),
    RATE_LIMIT_PER_MINUTE: z.number().int().positive().default(60)
});

export type ApiConfigType = z.infer<typeof ApiConfig>;

export const getValidatedConfig = (): ApiConfigType => {
    const config = {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        API_BASE_URL: process.env.API_BASE_URL,
        MAX_RETRIES: Number(process.env.MAX_RETRIES),
        TIMEOUT_MS: Number(process.env.TIMEOUT_MS),
        RATE_LIMIT_PER_MINUTE: Number(process.env.RATE_LIMIT_PER_MINUTE)
    };

    return ApiConfig.parse(config);
};