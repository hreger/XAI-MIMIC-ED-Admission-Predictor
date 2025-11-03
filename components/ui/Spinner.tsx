
import React from 'react';

export const Spinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
        <p className="text-lg text-gray-300">Analyzing Patient Data...</p>
        <p className="text-sm text-gray-500">This may take a moment.</p>
    </div>
);
