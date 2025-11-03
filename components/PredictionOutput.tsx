
import React from 'react';
import { Card } from './ui/Card';

interface PredictionOutputProps {
    probability: number;
    prediction: 'Admit' | 'Discharge';
}

export const PredictionOutput: React.FC<PredictionOutputProps> = ({ probability, prediction }) => {
    const percentage = (probability * 100).toFixed(1);
    const isAdmit = prediction === 'Admit';
    const colorClass = isAdmit ? 'text-red-400' : 'text-green-400';
    const bgColorClass = isAdmit ? 'bg-red-500' : 'bg-green-500';

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (probability * circumference);

    return (
        <Card title="Model Prediction">
            <div className="p-6 flex flex-col md:flex-row items-center justify-around space-y-6 md:space-y-0 md:space-x-6">
                <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle className={colorClass} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    </svg>
                    <span className="absolute text-3xl font-bold text-white">{percentage}%</span>
                </div>
                <div className="text-center">
                    <p className="text-lg text-gray-400 mb-2">Probability of Admission</p>
                    <p className={`text-4xl font-bold ${colorClass}`}>{prediction}</p>
                    <p className="mt-2 text-gray-400">
                        {isAdmit 
                            ? "Model recommends admission for further observation and treatment." 
                            : "Model suggests patient may be safe for discharge."}
                    </p>
                </div>
            </div>
        </Card>
    );
};
