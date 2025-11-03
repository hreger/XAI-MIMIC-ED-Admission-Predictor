import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PredictionService } from '../services/predictionService';
import { ApiError } from '../utils/apiUtils';
import { PatientSchema } from '../schemas/patientSchema';

// Mock the Google Generative AI client
vi.mock('@google/generai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
            generateContent: vi.fn(),
        }),
    })),
}));

// Mock the config
vi.mock('../config/api', () => ({
    getValidatedConfig: vi.fn().mockReturnValue({
        GOOGLE_API_KEY: 'mock-api-key',
    }),
}));

describe('PredictionService', () => {
    let predictionService: PredictionService;
    const mockPatientData = {
        age: 55,
        gender: 'Male',
        race: 'White',
        heartRate: 110,
        respiratoryRate: 22,
        systolicBP: 95,
        diastolicBP: 60,
        oxygenSaturation: 94,
        temperature: 38.5,
        triageNote: 'Test triage note',
    };

    const mockPredictionResponse = {
        admissionProbability: 0.85,
        prediction: 'High risk of admission',
        structuredFeatureImportance: [
            { name: 'age', value: 0.3 },
            { name: 'heartRate', value: 0.5 },
        ],
        textFeatureImportance: [
            { text: 'chest pain', importance: 0.4 },
            { text: 'shortness of breath', importance: 0.3 },
        ],
        fairnessMetrics: {
            disparateImpact: { name: 'Disparate Impact', value: 0.95 },
            equalOpportunity: { name: 'Equal Opportunity', value: 0.92 },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        predictionService = PredictionService.getInstance();
    });

    it('should validate patient data before making prediction', async () => {
        const validationResult = PatientSchema.safeParse(mockPatientData);
        expect(validationResult.success).toBe(true);
    });

    it('should successfully predict admission', async () => {
        // Mock successful API response
        const mockGenerateContent = vi.fn().mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockPredictionResponse),
            },
        });

        const mockModel = {
            generateContent: mockGenerateContent,
        };

        vi.spyOn(predictionService as any, 'model', 'get').mockReturnValue(mockModel);

        const result = await predictionService.predictAdmission(mockPatientData);

        expect(result).toEqual(mockPredictionResponse);
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
        // Mock API error
        const mockGenerateContent = vi.fn().mockRejectedValue(
            new Error('API Error')
        );

        const mockModel = {
            generateContent: mockGenerateContent,
        };

        vi.spyOn(predictionService as any, 'model', 'get').mockReturnValue(mockModel);

        await expect(predictionService.predictAdmission(mockPatientData)).rejects.toThrow(
            ApiError
        );
    });

    it('should handle invalid response format', async () => {
        // Mock invalid JSON response
        const mockGenerateContent = vi.fn().mockResolvedValue({
            response: {
                text: () => 'Invalid JSON',
            },
        });

        const mockModel = {
            generateContent: mockGenerateContent,
        };

        vi.spyOn(predictionService as any, 'model', 'get').mockReturnValue(mockModel);

        await expect(predictionService.predictAdmission(mockPatientData)).rejects.toThrow(
            'Failed to parse model response'
        );
    });

    it('should retry on temporary failures', async () => {
        // Mock temporary failure followed by success
        const mockGenerateContent = vi.fn()
            .mockRejectedValueOnce(new Error('Temporary error'))
            .mockResolvedValueOnce({
                response: {
                    text: () => JSON.stringify(mockPredictionResponse),
                },
            });

        const mockModel = {
            generateContent: mockGenerateContent,
        };

        vi.spyOn(predictionService as any, 'model', 'get').mockReturnValue(mockModel);

        const result = await predictionService.predictAdmission(mockPatientData);

        expect(result).toEqual(mockPredictionResponse);
        expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
});