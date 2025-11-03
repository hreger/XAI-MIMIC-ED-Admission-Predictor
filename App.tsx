
import React, { useState, useCallback } from 'react';
import { PatientInput } from './components/PatientInput';
import { PredictionOutput } from './components/PredictionOutput';
import { StructuredExplanation } from './components/StructuredExplanation';
import { TextExplanation } from './components/TextExplanation';
import { FairnessAudit } from './components/FairnessAudit';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Spinner } from './components/ui/Spinner';
import { ErrorDisplay } from './components/ui/ErrorDisplay';
import { Welcome } from './components/Welcome';
import { getEDPrediction } from './services/geminiService';
import type { PatientData, PredictionResponse } from './types';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);

    const handlePredict = useCallback(async (patientData: PatientData) => {
        setIsLoading(true);
        setError(null);
        setPredictionData(null);
        try {
            const result = await getEDPrediction(patientData);
            setPredictionData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <PatientInput onPredict={handlePredict} isLoading={isLoading} />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        {isLoading && (
                            <div className="flex justify-center items-center h-full min-h-[500px]">
                                <Spinner />
                            </div>
                        )}
                        {error && <ErrorDisplay message={error} />}
                        
                        {!isLoading && !error && !predictionData && (
                            <Welcome />
                        )}

                        {predictionData && (
                            <>
                                <PredictionOutput 
                                    probability={predictionData.admissionProbability} 
                                    prediction={predictionData.prediction} 
                                />
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <TextExplanation 
                                        note={predictionData.triageNote}
                                        explanation={predictionData.textFeatureImportance} 
                                    />
                                    <StructuredExplanation data={predictionData.structuredFeatureImportance} />
                                </div>
                                <FairnessAudit data={predictionData.fairnessMetrics} />
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;
