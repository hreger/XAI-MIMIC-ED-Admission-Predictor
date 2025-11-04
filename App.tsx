import React, { useState } from 'react';
import type { PatientData, PredictionResult, Bed, AdmissionTokenData } from './types';
import { getAdmissionPrediction } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PatientInput } from './components/PatientInput';
import { Welcome } from './components/Welcome';
import { PredictionOutput } from './components/PredictionOutput';
import { StructuredExplanation } from './components/StructuredExplanation';
import { TextExplanation } from './components/TextExplanation';
import { FairnessAudit } from './components/FairnessAudit';
import { CounterfactualExploration } from './components/CounterfactualExploration';
import { Spinner } from './components/ui/Spinner';
import { ErrorDisplay } from './components/ui/ErrorDisplay';
import { BedManagement } from './components/BedManagement';
import { AdmissionToken } from './components/AdmissionToken';

const initialPatientData: PatientData = {
    age: 55,
    gender: 'Male',
    race: 'White',
    heartRate: 110,
    respiratoryRate: 22,
    systolicBP: 95,
    diastolicBP: 60,
    oxygenSaturation: 94,
    temperature: 38.5,
    triageNote: 'Patient presents with severe chest pain radiating to the left arm. Patient is diaphoretic and short of breath. History of CAD.',
};

type AppState = 'welcome' | 'loading' | 'prediction' | 'bed_management' | 'token_generated' | 'error';

function App() {
    const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
    const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
    const [admissionToken, setAdmissionToken] = useState<AdmissionTokenData | null>(null);
    const [appState, setAppState] = useState<AppState>('welcome');
    const [error, setError] = useState<string | null>(null);
    const [isCounterfactual, setIsCounterfactual] = useState<boolean>(false);

    const handlePredict = async (data: PatientData) => {
        setAppState('loading');
        setError(null);
        setPredictionResult(null);
        try {
            const result = await getAdmissionPrediction(data);
            setPredictionResult(result);
            setPatientData(data);
            setAppState('prediction');
            setIsCounterfactual(false);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            setAppState('error');
        }
    };
    
    const handleTestCounterfactual = (newPatientData: PatientData) => {
        setIsCounterfactual(true);
        setPatientData(newPatientData);
        handlePredict(newPatientData);
    };

    const handleFindBed = () => {
        setAppState('bed_management');
    };

    const handleBedAllocated = (bed: Bed) => {
        const patientId = `P${String(Math.floor(100000 + Math.random() * 900000))}`;
        const finalToken: AdmissionTokenData = {
            patientData: patientData,
            predictionResult: predictionResult!,
            allocatedBed: bed,
            patientId: patientId,
            admissionDate: new Date().toLocaleString(),
        };
        setAdmissionToken(finalToken);
        setAppState('token_generated');
    };
    
    const handleReset = () => {
      setPatientData(initialPatientData);
      setPredictionResult(null);
      setAdmissionToken(null);
      setAppState('welcome');
      setError(null);
      setIsCounterfactual(false);
    };

    const renderContent = () => {
        switch (appState) {
            case 'loading':
                return <Spinner />;
            case 'error':
                return <ErrorDisplay message={error!} />;
            case 'prediction':
                if (!predictionResult) return <Welcome />;
                return (
                    <div className="space-y-6">
                        {isCounterfactual && (
                             <div className="bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-300 p-4 rounded-r-lg">
                                <p className="font-semibold">Counterfactual Scenario Result</p>
                                <p className="text-sm mt-1">This is the prediction based on the modified patient data.</p>
                            </div>
                        )}
                        <PredictionOutput 
                            prediction={predictionResult.prediction}
                            probability={predictionResult.admissionProbability}
                            timeToAdmission={predictionResult.estimatedTimeToAdmission}
                            onFindBed={handleFindBed}
                        />
                        <StructuredExplanation data={predictionResult.structuredExplanation} />
                        <TextExplanation note={patientData.triageNote} explanation={predictionResult.textExplanation} />
                        <FairnessAudit data={predictionResult.fairnessAudit} />
                        {predictionResult.prediction === 'Admit' && predictionResult.counterfactuals.length > 0 && (
                            <CounterfactualExploration 
                                counterfactuals={predictionResult.counterfactuals}
                                currentPatientData={patientData}
                                onTestScenario={handleTestCounterfactual}
                            />
                        )}
                    </div>
                );
            case 'bed_management':
                return <BedManagement 
                    patientData={patientData} 
                    predictionResult={predictionResult!} 
                    onBedSelected={handleBedAllocated} 
                    onBack={() => setAppState('prediction')}
                />;
            case 'token_generated':
                return <AdmissionToken 
                    tokenData={admissionToken!} 
                    onDone={handleReset} 
                />;
            case 'welcome':
            default:
                return <Welcome />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <PatientInput
                            patientData={patientData}
                            setPatientData={setPatientData}
                            onPredict={handlePredict}
                            isLoading={appState === 'loading'}
                            isReadOnly={appState === 'bed_management' || appState === 'token_generated'}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        {renderContent()}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default App;
