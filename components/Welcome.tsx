
import React from 'react';
import { Card } from './ui/Card';

export const Welcome: React.FC = () => {
    return (
        <Card title="Welcome to the ED Admission Prediction Framework">
            <div className="p-6 space-y-4 text-gray-300">
                <p>
                    This tool demonstrates an explainable AI system for predicting emergency department admissions.
                </p>
                <p>
                    <strong>How it works:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Enter patient vitals, demographics, and a free-text triage note in the panel on the left.</li>
                    <li>Click "Predict Admission" to send the data to a simulated AI model powered by the Gemini API.</li>
                    <li>The model will return a prediction, along with explanations (SHAP & LIME) and a fairness audit.</li>
                </ul>
                <p className="pt-4 font-semibold text-cyan-400">
                    To get started, please fill in the patient information and click the predict button.
                </p>
            </div>
        </Card>
    );
};
