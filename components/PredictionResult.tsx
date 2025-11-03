import React from 'react';
import { Card } from './ui/Card';
import type { PredictionResponse } from '../types';

interface PredictionResultProps {
    data: PredictionResponse | null;
    error: string | null;
    isLoading: boolean;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({
    data,
    error,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <Card title="Prediction Results">
                <div className="p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Error">
                <div className="p-6">
                    <div className="bg-red-900/50 border border-red-500 rounded-md p-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <Card title="Prediction Results">
            <div className="p-6 space-y-6">
                {/* Admission Prediction */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-cyan-400">
                        Admission Prediction
                    </h3>
                    <div className="bg-gray-800 rounded-md p-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <span>Probability:</span>
                            <span className="text-cyan-400 font-semibold">
                                {(data.admissionProbability * 100).toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-gray-300">{data.prediction}</p>
                    </div>
                </div>

                {/* Structured Feature Importance */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-cyan-400">
                        Structured Feature Importance (SHAP)
                    </h3>
                    <div className="space-y-2">
                        {data.structuredFeatureImportance.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 rounded-md p-3 flex justify-between items-center"
                            >
                                <span>{feature.name}:</span>
                                <span
                                    className={`font-semibold ${feature.value >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                >
                                    {feature.value.toFixed(3)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Text Feature Importance */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-cyan-400">
                        Text Feature Importance (LIME)
                    </h3>
                    <div className="bg-gray-800 rounded-md p-4">
                        <div className="space-y-2">
                            {data.textFeatureImportance.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center"
                                >
                                    <span>{feature.text}</span>
                                    <span
                                        className={`font-semibold ${feature.importance >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                    >
                                        {feature.importance.toFixed(3)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fairness Metrics */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-cyan-400">
                        Fairness Metrics
                    </h3>
                    <div className="bg-gray-800 rounded-md p-4 space-y-2">
                        {Object.entries(data.fairnessMetrics).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex justify-between items-center"
                            >
                                <span>{value.name}:</span>
                                <span className="font-semibold text-cyan-400">
                                    {value.value.toFixed(3)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};