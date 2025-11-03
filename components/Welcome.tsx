
import React from 'react';
import { Card } from './ui/Card';

export const Welcome: React.FC = () => {
    return (
        <Card title="Smart ED Admission Risk Assessment System">
            <div className="p-6 space-y-4 text-gray-300">
                <p>
                    Welcome to our advanced emergency department admission prediction system, designed to assist healthcare professionals in making informed decisions.
                </p>
                <p>
                    <strong>Features:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Comprehensive patient assessment through vital signs and demographic data analysis</li>
                    <li>Natural language processing of triage notes for enhanced prediction accuracy</li>
                    <li>Transparent decision-making with detailed SHAP and LIME explanations</li>
                    <li>Built-in fairness monitoring to ensure equitable predictions across patient groups</li>
                </ul>
                <p className="pt-4 font-semibold text-cyan-400">
                    Begin your assessment by entering patient information in the left panel.
                </p>
            </div>
        </Card>
    );
};
