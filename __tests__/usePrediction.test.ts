import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrediction } from '../hooks/usePrediction';
import { predictionService } from '../services/predictionService';
import { ApiError } from '../utils/apiUtils';

// Mock the prediction service
vi.mock('../services/predictionService', () => ({
    predictionService: {
        predictAdmission: vi.fn(),
    },
}));

describe('usePrediction', () => {
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
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => usePrediction());

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle successful prediction', async () => {
        vi.mocked(predictionService.predictAdmission).mockResolvedValue(
            mockPredictionResponse
        );

        const { result } = renderHook(() => usePrediction());

        await act(async () => {
            await result.current.predict(mockPatientData);
        });

        expect(result.current.data).toEqual(mockPredictionResponse);
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(predictionService.predictAdmission).toHaveBeenCalledWith(
            mockPatientData
        );
    });

    it('should handle API errors', async () => {
        const mockError = new ApiError(
            'PredictionFailed',
            'Failed to generate prediction',
            500
        );

        vi.mocked(predictionService.predictAdmission).mockRejectedValue(mockError);

        const { result } = renderHook(() => usePrediction());

        await act(async () => {
            await result.current.predict(mockPatientData);
        });

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe('Failed to generate prediction. Please try again.');
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle rate limit errors', async () => {
        const mockError = new ApiError(
            'RateLimitExceeded',
            'Rate limit exceeded',
            429
        );

        vi.mocked(predictionService.predictAdmission).mockRejectedValue(mockError);

        const { result } = renderHook(() => usePrediction());

        await act(async () => {
            await result.current.predict(mockPatientData);
        });

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe('Too many requests. Please try again later.');
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle unexpected errors', async () => {
        const mockError = new Error('Unexpected error');

        vi.mocked(predictionService.predictAdmission).mockRejectedValue(mockError);

        const { result } = renderHook(() => usePrediction());

        await act(async () => {
            await result.current.predict(mockPatientData);
        });

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe('An unexpected error occurred');
        expect(result.current.isLoading).toBe(false);
    });

    it('should reset state correctly', async () => {
        vi.mocked(predictionService.predictAdmission).mockResolvedValue(
            mockPredictionResponse
        );

        const { result } = renderHook(() => usePrediction());

        await act(async () => {
            await result.current.predict(mockPatientData);
        });

        expect(result.current.data).toEqual(mockPredictionResponse);

        act(() => {
            result.current.reset();
        });

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });
});