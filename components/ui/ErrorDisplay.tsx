
import React from 'react';
import { Card } from './Card';

interface ErrorDisplayProps {
    message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    return (
        <Card title="An Error Occurred">
            <div className="p-6 bg-red-900/20 border-l-4 border-red-500 text-red-300">
                <p className="font-semibold">Prediction Failed</p>
                <p className="mt-2 text-sm">{message}</p>
            </div>
        </Card>
    );
};
