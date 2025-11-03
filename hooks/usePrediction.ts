import { useState, useCallback } from 'react';
import { predictionService } from '../services/predictionService';
import type { ValidatedPatientData } from '../schemas/patientSchema';
import type { PredictionResponse } from '../types';
import { ApiError } from '../utils/apiUtils';

interface PredictionState {
    data: PredictionResponse | null;
    error: string | null;
    isLoading: boolean;
}

export const usePrediction = () => {
    const [state, setState] = useState<PredictionState>({
        data: null,
        error: null,
        isLoading: false,
    });

    const predict = useCallback(async (patientData: ValidatedPatientData) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const result = await predictionService.predictAdmission(patientData);
            setState({
                data: result,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            let errorMessage = 'An unexpected error occurred';
            
            if (error instanceof ApiError) {
                errorMessage = error.message;
                
                // Handle specific error types
                switch (error.code) {
                    case 'RateLimitExceeded':
                        errorMessage = 'Too many requests. Please try again later.';
                        break;
                    case 'InvalidResponseFormat':
                        errorMessage = 'Invalid response from prediction service. Please try again.';
                        break;
                    case 'PredictionFailed':
                        errorMessage = 'Failed to generate prediction. Please try again.';
                        break;
                }
            }

            setState({
                data: null,
                error: errorMessage,
                isLoading: false,
            });
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            data: null,
            error: null,
            isLoading: false,
        });
    }, []);

    return {
        ...state,
        predict,
        reset,
    };
};