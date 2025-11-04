import React from 'react';
import { Card } from './ui/Card';
import type { Counterfactual, PatientData } from '../types';

interface CounterfactualExplorationProps {
    counterfactuals: Counterfactual[];
    currentPatientData: PatientData;
    onTestScenario: (newPatientData: PatientData) => void;
}

const LightbulbIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const featureNameMap: Record<string, string> = {
    age: 'Age',
    gender: 'Gender',
    race: 'Race',
    heartRate: 'Heart Rate',
    respiratoryRate: 'Respiratory Rate',
    systolicBP: 'Systolic BP',
    diastolicBP: 'Diastolic BP',
    oxygenSaturation: 'O2 Saturation',
    temperature: 'Temperature',
    triageNote: 'Triage Note',
}

export const CounterfactualExploration: React.FC<CounterfactualExplorationProps> = ({ counterfactuals, currentPatientData, onTestScenario }) => {
    
    const handleTestClick = (counterfactual: Counterfactual) => {
        const { feature, suggestedValue } = counterfactual;
        
        // Ensure numeric types are correctly parsed from the string suggestion
        const numericFields: (keyof PatientData)[] = ['age', 'heartRate', 'respiratoryRate', 'systolicBP', 'diastolicBP', 'oxygenSaturation', 'temperature'];
        let finalSuggestedValue: string | number = suggestedValue;
        if (numericFields.includes(feature as any)) {
            finalSuggestedValue = parseFloat(suggestedValue as string);
        }

        const newPatientData: PatientData = {
            ...currentPatientData,
            [feature]: finalSuggestedValue,
        };
        onTestScenario(newPatientData);
    };

    return (
        <Card title="Counterfactual Analysis: What Could Change the Outcome?">
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-400">The model suggests the prediction could flip to <span className="font-semibold text-green-400">'Discharge'</span> with one of the following changes:</p>
                {counterfactuals.map((cf, index) => (
                    <div key={index} className="bg-gray-700/50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <LightbulbIcon />
                            <div>
                                <p className="text-gray-200">
                                    If <strong className="text-cyan-400">{featureNameMap[cf.feature] || cf.feature}</strong> were <strong className="text-white">{cf.suggestedValue}</strong> (instead of {cf.originalValue}).
                                </p>
                                <p className="text-xs text-gray-400 mt-1 italic">"{cf.narrative}"</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleTestClick(cf)}
                            className="flex-shrink-0 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full sm:w-auto"
                        >
                            Test This Scenario
                        </button>
                    </div>
                ))}
            </div>
        </Card>
    );
};
