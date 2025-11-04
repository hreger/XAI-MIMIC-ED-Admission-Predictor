import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface PredictionOutputProps {
    probability: number;
    prediction: 'Admit' | 'Discharge';
    timeToAdmission?: string;
    onFindBed: () => void;
}

const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const PredictionOutput: React.FC<PredictionOutputProps> = ({ probability, prediction, timeToAdmission, onFindBed }) => {
    const percentage = (probability * 100).toFixed(1);
    const isAdmit = prediction === 'Admit';
    const colorClass = isAdmit ? 'text-red-400' : 'text-green-400';

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (probability * circumference);

    return (
        <Card title="Model Prediction">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-around space-y-6 md:space-y-0 md:space-x-6">
                    <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                            <circle className={colorClass} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        </svg>
                        <span className="absolute text-3xl font-bold text-white">{percentage}%</span>
                    </div>
                    <div className="text-center">
                        <p className="text-lg text-gray-400 mb-2">Prediction</p>
                        <p className={`text-4xl font-bold ${colorClass}`}>{prediction}</p>
                        <p className="mt-4 text-gray-400 max-w-sm">
                            {isAdmit 
                                ? "Model recommends admission for further observation and treatment." 
                                : "Model suggests patient may be safe for discharge."}
                        </p>
                    </div>
                    {isAdmit && timeToAdmission && (
                        <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-center">
                                <ClockIcon />
                                <div>
                                    <p className="text-sm text-gray-400">Est. Time to Admission</p>
                                    <p className="text-xl font-semibold text-white">{timeToAdmission}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {isAdmit && (
                    <div className="mt-6 pt-6 border-t border-gray-700 flex justify-center">
                        <Button onClick={onFindBed}>
                           Find & Allocate Bed
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};