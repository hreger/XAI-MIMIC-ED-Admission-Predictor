
import React from 'react';

const MedicalIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M7 20h10" />
    </svg>
);

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <MedicalIcon />
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
                        XAI-MIMIC ED Admission Predictor
                    </h1>
                </div>
            </div>
        </header>
    );
};
