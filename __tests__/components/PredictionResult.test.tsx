import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PredictionResult } from '../../components/PredictionResult';

describe('PredictionResult', () => {
    const mockPredictionData = {
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

    it('should render loading state', () => {
        render(<PredictionResult data={null} error={null} isLoading={true} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render error state', () => {
        const errorMessage = 'Test error message';
        render(<PredictionResult data={null} error={errorMessage} isLoading={false} />);
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should render prediction results', () => {
        render(
            <PredictionResult
                data={mockPredictionData}
                error={null}
                isLoading={false}
            />
        );

        // Check admission probability
        expect(screen.getByText('85.0%')).toBeInTheDocument();
        expect(screen.getByText('High risk of admission')).toBeInTheDocument();

        // Check structured feature importance
        mockPredictionData.structuredFeatureImportance.forEach(feature => {
            expect(screen.getByText(feature.name)).toBeInTheDocument();
            expect(screen.getByText(feature.value.toFixed(3))).toBeInTheDocument();
        });

        // Check text feature importance
        mockPredictionData.textFeatureImportance.forEach(feature => {
            expect(screen.getByText(feature.text)).toBeInTheDocument();
            expect(screen.getByText(feature.importance.toFixed(3))).toBeInTheDocument();
        });

        // Check fairness metrics
        Object.values(mockPredictionData.fairnessMetrics).forEach(metric => {
            expect(screen.getByText(metric.name)).toBeInTheDocument();
            expect(screen.getByText(metric.value.toFixed(3))).toBeInTheDocument();
        });
    });

    it('should not render anything when no data, error, or loading', () => {
        const { container } = render(
            <PredictionResult data={null} error={null} isLoading={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render feature importance values with correct colors', () => {
        render(
            <PredictionResult
                data={mockPredictionData}
                error={null}
                isLoading={false}
            />
        );

        // Check positive values are green
        const positiveValue = screen.getByText('0.500'); // heartRate value
        expect(positiveValue).toHaveClass('text-green-400');

        // Add a negative value to mock data and check it's red
        const negativeData = {
            ...mockPredictionData,
            structuredFeatureImportance: [
                ...mockPredictionData.structuredFeatureImportance,
                { name: 'test', value: -0.5 },
            ],
        };

        render(
            <PredictionResult
                data={negativeData}
                error={null}
                isLoading={false}
            />
        );

        const negativeValue = screen.getByText('-0.500');
        expect(negativeValue).toHaveClass('text-red-400');
    });
});