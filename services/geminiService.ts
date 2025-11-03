
import { GoogleGenAI, Type } from "@google/genai";
import type { PatientData, PredictionResponse } from '../types';
import { getValidatedConfig } from '../config/api';
import { withRetry, RateLimiter, ApiError } from '../utils/apiUtils';

const config = getValidatedConfig();
const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

// Initialize rate limiter
const rateLimiter = new RateLimiter(
    60000, // 1 minute window
    config.RATE_LIMIT_PER_MINUTE
);

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        admissionProbability: { type: Type.NUMBER, description: "A value between 0 and 1." },
        prediction: { type: Type.STRING, enum: ["Admit", "Discharge"] },
        triageNote: { type: Type.STRING, description: "The original triage note provided." },
        structuredFeatureImportance: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    feature: { type: Type.STRING },
                    value: { type: Type.STRING },
                    importance: { type: Type.NUMBER, description: "SHAP value, can be positive or negative." },
                },
                required: ["feature", "value", "importance"],
            },
        },
        textFeatureImportance: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    importance: { type: Type.NUMBER, description: "LIME value, can be positive or negative." },
                },
                required: ["word", "importance"],
            },
        },
        fairnessMetrics: {
            type: Type.OBJECT,
            properties: {
                Gender: {
                    type: Type.OBJECT,
                    properties: {
                        Male: { type: Type.OBJECT, properties: {
                            accuracy: { type: Type.NUMBER },
                            precision: { type: Type.NUMBER },
                            recall: { type: Type.NUMBER },
                            f1_score: { type: Type.NUMBER },
                        }},
                        Female: { type: Type.OBJECT, properties: {
                            accuracy: { type: Type.NUMBER },
                            precision: { type: Type.NUMBER },
                            recall: { type: Type.NUMBER },
                            f1_score: { type: Type.NUMBER },
                        }},
                    },
                },
                Race: {
                    type: Type.OBJECT,
                    properties: {
                        White: { type: Type.OBJECT, properties: {
                            accuracy: { type: Type.NUMBER },
                            precision: { type: Type.NUMBER },
                            recall: { type: Type.NUMBER },
                            f1_score: { type: Type.NUMBER },
                        }},
                        Black: { type: Type.OBJECT, properties: {
                            accuracy: { type: Type.NUMBER },
                            precision: { type: Type.NUMBER },
                            recall: { type: Type.NUMBER },
                            f1_score: { type: Type.NUMBER },
                        }},
                        Asian: { type: Type.OBJECT, properties: {
                            accuracy: { type: Type.NUMBER },
                            precision: { type: Type.NUMBER },
                            recall: { type: Type.NUMBER },
                            f1_score: { type: Type.NUMBER },
                        }},
                        Hispanic: { type: Type.OBJECT, properties: {
                            accuracy: { type: Type.NUMBER },
                            precision: { type: Type.NUMBER },
                            recall: { type: Type.NUMBER },
                            f1_score: { type: Type.NUMBER },
                        }},
                    },
                },
            },
        },
    },
    required: ["admissionProbability", "prediction", "triageNote", "structuredFeatureImportance", "textFeatureImportance", "fairnessMetrics"],
};

export async function predictAdmission(patientData: PatientData): Promise<PredictionResponse> {
    try {
        await rateLimiter.waitForAvailability();

        return await withRetry(async () => {
            const model = ai.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `Analyze the following patient data and predict admission likelihood:\n${JSON.stringify(patientData, null, 2)}`;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.8,
                    topK: 40,
                },
            });

            const response = result.response;
            if (!response.candidates || response.candidates.length === 0) {
                throw new ApiError(500, 'No response generated from the model');
            }

            const prediction = JSON.parse(response.candidates[0].content.parts[0].text);
            return prediction as PredictionResponse;
        });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            500,
            'Failed to generate prediction',
            error
        );
    }
}
