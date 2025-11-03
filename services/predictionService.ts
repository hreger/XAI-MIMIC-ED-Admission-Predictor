import { GoogleGenerativeAI } from '@google/generai';
import { RateLimiter } from '../utils/apiUtils';
import { withRetry } from '../utils/apiUtils';
import { ApiError } from '../utils/apiUtils';
import { getValidatedConfig } from '../config/api';
import type { ValidatedPatientData } from '../schemas/patientSchema';
import type { PredictionResponse } from '../types';

const config = getValidatedConfig();
const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Initialize rate limiter: 60 requests per minute
const rateLimiter = new RateLimiter(60, 60000);

export class PredictionService {
    private static instance: PredictionService;

    private constructor() {}

    public static getInstance(): PredictionService {
        if (!PredictionService.instance) {
            PredictionService.instance = new PredictionService();
        }
        return PredictionService.instance;
    }

    public async predictAdmission(patientData: ValidatedPatientData): Promise<PredictionResponse> {
        await rateLimiter.waitForToken();

        try {
            const result = await withRetry(
                async () => {
                    const prompt = this.constructPrompt(patientData);
                    const result = await model.generateContent(prompt);
                    const response = result.response;
                    const text = response.text();
                    
                    try {
                        return JSON.parse(text) as PredictionResponse;
                    } catch (e) {
                        throw new ApiError(
                            'InvalidResponseFormat',
                            'Failed to parse model response',
                            500
                        );
                    }
                },
                {
                    maxRetries: 3,
                    baseDelay: 1000,
                    maxDelay: 5000,
                }
            );

            return result;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                'PredictionFailed',
                'Failed to generate prediction',
                500
            );
        }
    }

    private constructPrompt(patientData: ValidatedPatientData): string {
        return `Analyze the following patient data and provide a prediction for ED admission. Return the response in JSON format with admission probability, prediction explanation, SHAP values for structured features, LIME values for text features, and fairness metrics for gender.

Patient Data:
${JSON.stringify(patientData, null, 2)}`;
    }
}

export const predictionService = PredictionService.getInstance();