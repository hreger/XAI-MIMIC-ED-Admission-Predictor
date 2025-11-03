
import React from 'react';
import { Header } from './components/Header';
import { Welcome } from './components/Welcome';
import { PatientInput } from './components/PatientInput';
import { PredictionResult } from './components/PredictionResult';
import { usePrediction } from './hooks/usePrediction';

export const App: React.FC = () => {
    const { data, error, isLoading, predict, reset } = usePrediction();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <Welcome />
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PatientInput onPredict={predict} isLoading={isLoading} />
                    <PredictionResult
                        data={data}
                        error={error}
                        isLoading={isLoading}
                    />
                </div>
            </main>
        </div>
    );
};
